'use strict';

const {parseArgs} = require('../lib/parser');
const {findGameFromName, findGames} = require('../lib/games');

const definition = {
  name: 'game',
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
  aliases: ['games'],
};

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

  let games;
  if (name) {
    const game = await findGameFromName(ctx, name);
    games = game ? [game] : [];
  } else {
    games = await findGames(ctx, args);
  }
  let msg = `Here's what I found: ` + games.map((game) => {
    return `${game.title} (${game.released.getFullYear()})`;
  }).join(', ');
  message.reply(msg);
};

module.exports = {
  help: definition,
  conf: configuration,
  run: run,
};
