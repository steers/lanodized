'use strict';

const {parseArgs} = require('../lib/parser');
const chat = require('../lib/chat');
const Help = require('../lib/help');
const Template = require('../lib/template');

// Declaration of command name, parameters and usage information.
// Used to build help documentation and in the parsing of arguments.
const definition = {
  name: 'template',
  aliases: ['example', 'ex'],
  description: 'Example command template, for development purposes.',
  usage: '[options] [args]',
  options: {
    help: {
      type: 'boolean',
      alias: 'h',
      description: 'print command usage',
    },
    boolean: {
      type: 'boolean',
      alias: 'b',
      description: 'true if specified, takes an optional boolean argument',
    },
    integer: {
      type: 'integer',
      alias: 'i',
      description: 'takes an integer argument',
    },
    string: {
      type: 'string',
      alias: 's',
      description: 'takes a string argument',
    },
  },
};

const configuration = {
  // Whether the command should be loaded during initialization
  enabled: false,
  // Whether the command replies back to users in direct channels
  direct: false,
};

// Templates are defined in the concise Handlebars format
const template = {};
template.example = Template.compile([
  'Here are the arguments you provided:',
  '```{{#each .}}',
  '\t{{@key}} = {{this}}',
  '{{/each}}```',
].join('\n'), {noEscape: true});

/**
 * Execute the defined command in response to an incoming chat message.
 * @param  {Object} ctx Application context
 * @param  {Object} client Chat client object
 * @param  {Object} message Chat message
 * @param  {string[]} argv Tokenized arguments
 * @return {Object} Result metadata from command execution.
 */
async function run(ctx, client, message, argv) {
  const args = parseArgs(argv, definition.options);

  let content;
  if (args.help) {
    content = Help.usage(definition, {prefix: client.config.prefix, detailed: true});
  } else {
    content = template.example(args);
  }

  const result = {};
  const actions = [];
  try {
    if (configuration.direct) {
      actions.push(...await chat.replyDirect(message, content));
    } else {
      actions.push(...await chat.reply(message, content));
    }
  } catch (err) {
    result.error = err.toString().slice(0, 256);
    ctx.log(`Encountered an error running ${definition.name}`, 'error', err);
  }
  result.actions = actions;
  return result;
}

module.exports = {
  help: definition,
  conf: configuration,
  run: run,
};