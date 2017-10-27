'use strict';

const Handlebars = require('handlebars');

Handlebars.registerHelper('formatDate', (datetime, format) => {
  switch (format) {
    case 'year':
      return datetime.getFullYear();
  }
});

Handlebars.registerHelper('join', (context, options) => {
  const delim = options.hash['delim'] || '/';
  const templated = context.map((elem) => {
    return options.fn(elem);
  });
  return templated.join(delim);
});

module.exports = Handlebars;
