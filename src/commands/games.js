'use strict';

const {parseArgs} = require('../lib/parser');
const {findGameFromName, findGames} = require('../lib/games');
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
};

const template = {};
template.simple = Template.compile([
  '{{#each .}}',
  '**{{title}}** ({{formatDate released "year"}}) `[{{#join Aliases delim="|"}}{{name}}{{/join}}]`',
  '{{/each}}',
].join('\n'), {noEscape: true});
template.detailed = Template.compile([
  '**{{title}}** ({{formatDate released "year"}}) `[{{#join Aliases delim="|"}}{{name}}{{/join}}]`',
].join('\n'), {noEscape: true});

/**
 * Execute the game command in response to an incoming chat message.
 * @param  {Object} ctx Application context
 * @param  {Object} client Chat client object
 * @param  {Object} message Chat message
 * @param  {string[]} argv Tokenized arguments
 * @return {undefined}
 */
async function run(ctx, client, message, argv) {
  const args = parseArgs(argv, definition.options);
  const name = args._.join(' ');
  delete args._;

  let msg;
  if (name) {
    const game = await findGameFromName(ctx, name);
    msg = game ? template.detailed(game)
      : `Sorry, couldn't find a game with that name.`;
  } else {
    const games = await findGames(ctx, args);
    msg = games ? template.simple(games)
      : `Sorry, couldn't find any games matching your query.`;
  }
  await message.reply(msg);
};

module.exports = {
  help: definition,
  conf: configuration,
  run: run,
};
