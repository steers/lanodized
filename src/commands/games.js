'use strict';

const {parseArgs} = require('../lib/parser');
const {findGameFromName, findGames} = require('../lib/games');
const chat = require('../lib/chat');
const Template = require('../lib/template');

const definition = {
  name: 'game',
  aliases: ['games'],
  description: 'Query information for official games',
  usage: '[options] [name]',
  options: {
    genre: {
      type: 'string',
      alias: 'g',
      description: 'Game Genre',
    },
    platform: {
      type: 'string',
      alias: 'p',
      description: 'Game Platform',
    },
  },
};

const configuration = {
  enabled: true,
  direct: true,
};

const template = {};
template.simple = Template.compile([
  'Here are the official games matching your query:',
  '{{#each .}}**{{title}}** ({{formatDate released "year"}}) `[{{#join Aliases delim="|"}}{{name}}{{/join}}]`',
  '{{/each}}',
].join('\n'), {noEscape: true});
template.detailed = Template.compile([
  '**{{title}}** ({{formatDate released "year"}})',
  'Aliases: {{#join Aliases delim=", "}}`{{name}}`{{/join}}',
  'Genres: {{#join Genres delim=", "}}{{name}} (`{{short}}`){{/join}}',
  'Platforms: {{#join Platforms delim=", "}}`{{short}}`{{#if properties}} ({{properties.type}}){{/if}}{{/join}}',
  'Modes:',
  '{{#each Modes}} - `{{short}}` [{{serverSize}}/game {{groupSize}}/group]{{#if description}} : {{description}}{{/if}}',
  '{{/each}}',
].join('\n'), {noEscape: true});

/**
 * Execute the game command in response to an incoming chat message.
 * @param  {Object} ctx Application context
 * @param  {Object} client Chat client object
 * @param  {Object} message Chat message
 * @param  {string[]} argv Tokenized arguments
 * @return {Object} Result metadata from command execution.
 */
async function run(ctx, client, message, argv) {
  const args = parseArgs(argv, definition.options);
  const name = args._.join(' ');
  delete args._;

  let msg;
  if (name) {
    const game = await findGameFromName(ctx, name);
    msg = game ? template.detailed(game)
      : `Sorry, couldn't find an official game named anything like that.`;
  } else {
    const games = await findGames(ctx, args);
    msg = games.length ? template.simple(games)
      : `Sorry, couldn't find any official games matching your query.`;
  }

  const result = {};
  try {
    const actions = [];
    actions.concat(await chat.replyDirect(message, msg));
    result.actions = actions;
  } catch (err) {
    result.error = err.toString().slice(0, 256);
    ctx.log(`Encountered an error running ${definition.name}`, 'error', err);
  }
  return result;
};

module.exports = {
  help: definition,
  conf: configuration,
  run: run,
};
