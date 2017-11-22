'use strict';

const {arrayify} = require('./parser');
const moment = require('moment-timezone');

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
      if (!Array.isArray(value)) {
        return 'must be an array';
      }

      value.forEach((item) => {
        this.validate(item, options);
      });
    };
    this.validate.validators.eachProperty = (value, options) => {
      if (!this.validate.isObject(value) || this.validate.isArray(value)) {
        return 'must be an object';
      }

      for (const prop of Object.keys(value)) {
        this.validate(value[prop], options);
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
    this.genres = await ctx.db.Genre.findAll();
    this.platforms = await ctx.db.Platform.findAll();
    this.eventTypes = await ctx.db.EventType.findAll();
  }

  /**
   * Ensure the given game definition meets specifications. Will throw if invalid.
   * @param  {Object} definition Game definition
   */
  validateGame(definition) {
    const self = this;
    const mode = {
      'name': {
        format: self.constructor.TITLE_PATTERN,
      },
      'short': {
        presence: true,
        format: self.constructor.SHORT_PATTERN,
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
          greaterThan: 1,
        },
      },
      'description': {},
      'properties': {},
    };
    const constraints = {

      'aliases': {
        presence: true,
        length: {minimum: 1},
        array: {
          format: self.constructor.SHORT_PATTERN,
        },
      },
      'info.title': {
        presence: true,
        format: self.constructor.TITLE_PATTERN,
      },
      'info.released': {
        date: true,
      },
      'info.links': {
        containedBy: self.platforms.map((platform) => platform.short),
        eachProperty: {
          'info': {
            url: true,
          },
          'buy': {
            url: true,
          },
        },
      },
      'genres': {
        presence: true,
        length: {minimum: 1},
        containedBy: self.genres.map((genre) => genre.short),
      },
      'platforms': {
        presence: true,
        length: {minimum: 1},
        containedBy: self.platforms.map((platform) => platform.short),
      },
      'modes': {
        presence: true,
        length: {minimum: 1},
        array: mode,
      },
    };
    const invalidDefinition = this.validate(definition, constraints, {format: 'flat'});
    if (invalidDefinition) {
      throw new Error(`Invalid game: ${JSON.stringify(invalidDefinition)}`);
    }
  }
}

// Matches short aliases and the like
DataFileValidator.SHORT_PATTERN = /[-_a-z0-9]+/i;

// Ensure titles are sanitized
DataFileValidator.TITLE_PATTERN = /[-_:' a-z0-9]+/i;

module.exports = {
  DataFileValidator,
};
