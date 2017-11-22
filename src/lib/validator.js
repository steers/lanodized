'use strict';

const {arrayify} = require('./parser');
const moment = require('moment-timezone');

/**
 * Representation of a validation failure.
 */
class ValidationError extends Error {
  /**
   * Create a new ValidationError
   * @param  {string} message Error description
   * @param  {Object} reasons Validation failure reasons for each invalid parameter
   */
  constructor(message, reasons = {}) {
    super(message);
    this.name = 'ValidationError';
    this.reasons = reasons;
  }
}

/**
 * Validate the structure of data files (typically stored as JSON)
 */
class DataFileValidator {
  /**
   * Create a new DataFileValidator
   * @param  {String} tz Time zone used to convert all scanned timestamps.
   */
  constructor(tz = 'America/Toronto') {
    this.genres = [];
    this.platforms = [];
    this.eventTypes = [];

    this.validate = require('validate.js');
    this.validate.validators.containedBy = (value, options) => {
      const superset = new Set(arrayify(options));
      let values = arrayify(value);
      if (this.validate.isObject(value) && !this.validate.isArray(value)) {
        values = Object.keys(value);
      }
      if (!values.every((item) => superset.has(item))) {
        return `must contain only valid options: ${Array.from(superset).join(', ')}`;
      }
    };
    this.validate.validators.array = (value, options) => {
      if (!this.validate.isArray(value)) {
        return 'must be an array';
      }

      const failures = [];
      for (const item of value) {
        const invalid = this.validate.isObject(item)
          ? this.validate(item, options)
          : this.validate.single(item, options);
        if (invalid) {
          failures.push(...arrayify(invalid));
        }
      };
      if (failures.length > 0) {
        return failures;
      }
    };
    this.validate.validators.eachProperty = (value, options) => {
      if (!this.validate.isEmpty()) return;
      if (!this.validate.isObject(value) || this.validate.isArray(value)) {
        return 'must be an object';
      }

      const failures = [];
      for (const property of Object.keys(value)) {
        const invalid = this.validate.isObject(value[property])
          ? this.validate(value[property], options)
          : this.validate.single(value[property], options);
        if (invalid) {
          failures.push(...arrayify(invalid));
        }
      }
      if (failures.length > 0) {
        return failures;
      }
    };
    this.validate.extend(this.validate.validators.datetime, {
      // The value is guaranteed not to be null or undefined but otherwise it could be anything.
      parse: function(value, options) {
        return moment(value).tz(tz);
      },
      // Input is a unix timestamp (in milliseconds)
      format: function(value, options) {
        const format = options.dateOnly ? 'YYYY-MM-DD' : moment.ISO_8601;
        return moment(value).tz(tz).format(format);
      },
    });
  }

  /**
   * Load relevant entities from database to use in validation.
   * @param  {Object} ctx Application context
   * @param  {Object} ctx.db Database context
   */
  async load(ctx) {
    this.genres = await ctx.db.Genre.findAll({
      attributes: ['short'],
    }).map((genre) => genre.short);

    this.platforms = await ctx.db.Platform.findAll({
      attributes: ['short'],
    }).map((platform) => platform.short);

    this.eventTypes = await ctx.db.EventType.findAll({
      attributes: ['name'],
    }).map((type) => type.name);
  }

  /**
   * Ensure the given game definition meets specifications. Will throw if invalid.
   * @param  {Object} definition Game definition
   */
  validateGame(definition) {
    const self = this;
    const constraints = {
      'info': {
        presence: true,
      },
      'info.title': {
        presence: true,
        format: {
          pattern: self.constructor.TITLE_PATTERN,
          message: `'%{value}' is invalid`,
        },
      },
      'info.released': {
        date: true,
      },
      'info.links.buy': {
        eachProperty: {url: true},
        containedBy: ['default'].concat(self.platforms),
      },
      'info.links.info': {
        eachProperty: {url: true},
        containedBy: ['default'].concat(self.platforms),
      },
      'info.properties.free': {
        inclusion: [true, false],
      },
      'info.properties.steamId': {
        numericality: {
          strict: true,
          onlyInteger: true,
          greaterThan: 0,
        },
      },
      'aliases': {
        presence: true,
        length: {minimum: 1},
        array: {
          format: {
            pattern: self.constructor.SHORT_PATTERN,
            message: `'%{value}' is invalid`,
          },
        },
      },
      'genres': {
        presence: true,
        length: {minimum: 1},
        containedBy: self.genres,
      },
      'platforms': {
        presence: true,
        length: {minimum: 1},
        containedBy: self.platforms,
      },
      'modes': {
        presence: true,
        length: {minimum: 1},
        array: {
          'name': {
            format: {
              pattern: self.constructor.TITLE_PATTERN,
              message: `'%{value}' is invalid`,
            },
          },
          'short': {
            presence: true,
            format: {
              pattern: self.constructor.SHORT_PATTERN,
              message: `'%{value}' is invalid`,
            },
          },
          'serverSize': {
            presence: true,
            numericality: {
              strict: true,
              onlyInteger: true,
              greaterThan: 1,
            },
          },
          'groupSize': {
            presence: true,
            numericality: {
              strict: true,
              onlyInteger: true,
              greaterThan: 0,
            },
          },
          'description': {},
          'properties': {},
        },
      },
    };
    const invalidDefinition = this.validate(definition, constraints, {fullMessages: false});
    if (invalidDefinition) {
      throw new ValidationError('Game definition does not meet specifications.', invalidDefinition);
    }
  }

  /**
   * Ensure the given party definition meets specifications. Will throw if invalid.
   * @param  {Object} definition Party definition
   */
  validateParty(definition) {
    const self = this;
    const constraints = {
      'name': {
        presence: true,
        format: self.constructor.TITLE_PATTERN,
      },
      'iteration': {
        presence: true,
        numericality: {
          strict: true,
          onlyInteger: true,
          greaterThanOrEqualTo: 1,
        },
      },
      'start': {
        presence: true,
        datetime: true,
      },
      'end': {
        presence: true,
        datetime: true,
      },
      'events': {
        array: {
          'type': {
            presence: true,
            containedBy: self.eventTypes,
          },
          'title': {
            presence: {allowEmpty: false},
            length: {maximum: 255},
          },
          'start': {
            presence: true,
            datetime: true,
          },
          'minutes': {
            presence: true,
            numericality: {
              strict: true,
              greaterThan: 0,
            },
          },
          'games': {
            array: {
              format: {
                pattern: self.constructor.SHORT_PATTERN,
                message: `'%{value}' is invalid`,
              },
            },
          },
          'description': {},
          'properties': {},
          'properties.sponsor': {
            format: self.constructor.TITLE_PATTERN,
          },
        },
      },
    };
    const invalidDefinition = this.validate(definition, constraints, {fullMessages: false});
    if (invalidDefinition) {
      throw new ValidationError('Party definition does not meet specifications.', invalidDefinition);
    }
  }
}

// Matches short aliases and the like
DataFileValidator.SHORT_PATTERN = /[-_a-z0-9]+/i;

// Ensure titles are sanitized
DataFileValidator.TITLE_PATTERN = /[-_:'.,!?() a-z0-9]+/i;

module.exports = {
  DataFileValidator,
  ValidationError,
};
