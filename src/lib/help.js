'use strict';

const Template = require('./template');

const template = {};
template.simple = Template.compile([
  'Usage: `{{#if prefix}}{{prefix}}{{/if}}{{name}} {{usage}}',
  '{{#if aliases}} [aliases: {{#join aliases delim="|"}}{{this}}{{/join}}]`{{/if}}',
].join(''), {noEscape: true});
template.detailed = Template.compile([
  '{{description}}',
  'Usage: `{{#if prefix}}{{prefix}}{{/if}}{{name}} {{usage}}`',
  '{{#if aliases}}Aliases: `[{{#join aliases delim="|"}}{{this}}{{/join}}]`{{/if}}',
  '{{#if options}}Options:',
  '{{#each options}}',
  '  `--{{@key}}{{#if alias}} [-{{alias}}]{{/if}}{{#if type}} <{{type}}>{{/if}}` : {{description}}',
  '{{/each}}{{/if}}',
].join('\n'), {noEscape: true});

/**
 * Generate the usage text for a given command definition.
 * @param {Object} definition Command definition
 * @param {Object} options Text generation options
 * @oaram {boolean} opts.detailed True to generate a detailed usage message
 * @param {string} opts.prefix Command prefix
 * @return {string} Complete help text for the given command.
 */
function usage(definition, options) {
  const opts = options || {};
  const defn = Object.assign({prefix: opts.prefix}, definition);
  return opts.detailed ? template.detailed(defn) : template.simple(defn);
}

module.exports = {
    usage,
};
