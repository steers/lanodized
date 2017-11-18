'use strict';

const Handlebars = require('handlebars');
const moment = require('moment-timezone');

const DEFAULT_TZ = 'America/Toronto'; // TODO: Make this configurable

Handlebars.registerHelper('formatDate', (datetime, format) => {
  switch (format) {
    case 'year':
      return datetime.getFullYear();
  }
});

Handlebars.registerHelper('formatTime', (duration, format) => {
  return moment().tz(DEFAULT_TZ).add(duration, format).format('LTS');
});

Handlebars.registerHelper('join', (context, options) => {
  const delim = options.hash.delim || ' ';
  const templated = context.map((elem) => {
    return options.fn(elem);
  });
  return templated.join(delim);
});

module.exports = Handlebars;
