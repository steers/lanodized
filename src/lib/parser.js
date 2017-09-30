'use strict';

const parse = require('minimist');

function tokenize(str) {
  const tokens = [];
  const pattern = /\s*(?:([^'"]\S*)|'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)")\s*/g;
  const tokenizer = (match, unquoted, singlequote, doublequote) => {
    const token = unquoted ? unquoted : (singlequote ? singlequote : doublequote);
    tokens.push(token);
    return match;
  };
  str.replace(pattern, tokenizer);
  return tokens;
}

function parseArgs(argv, options = {}) {
  const parserOptions = {
    string: [],
    boolean: [],
    alias: {},
    default: {},
  };
  const passthroughOptions = new Set([
    '--', 'stopEarly', 'unknown',
  ]);
  Object.keys(options).forEach((key) => {
    let value = options[key];
    if (passthroughOptions.has(key)) {
      parserOptions[key] = value;
      return;
    }
    if (typeof value === 'string') {
      value = {type: value};
    }
    if (!value || typeof value !== 'object') {
      return;
    }
    const props = value;
    switch (props.type) {
      case 'string': {
        parserOptions.string.push(key);
        break;
      }
      case 'boolean': {
        parserOptions.boolean.push(key);
        break;
      }
    }
    const aliases = ((list) => {
      if (list === null || list === undefined) {
        return [];
      }
      return Array.isArray(list) ? list : [list];
    })(props.alias);
    if (aliases.length > 0) {
      parserOptions.alias[key] = aliases;
    }
    if (props.hasOwnProperty('default')) {
      parserOptions.default[key] = props.default;
    }
  });
  return parse(argv, parserOptions);
}

module.exports = {
  tokenize: tokenize,
  parseArgs: parseArgs,
};
