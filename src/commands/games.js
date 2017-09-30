'use strict';

const {parseArgs} = require('../lib/parser');

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

async function findGameFromName(ctx, name) {
  const alias = await ctx.db.GameAlias.findOne({
    where: {
      name: name,
    },
  });
  let game;
  const attrs = ['title', 'released', 'links', 'properties'];
  if (alias) {
    game = await alias.getGame({
      attributes: attrs,
  });
  } else {
    game = await ctx.db.Game.findOne({
      attributes: attrs,
      where: {
        title: {
          $iLike: `%${name}%`,
        },
      },
    });
  }
  return game;
}

async function findGames(ctx, options) {
  const includes = [];
  if (options.genre) {
    includes.push({
      model: ctx.db.Genre,
      through: ctx.db.GameGenre,
      attributes: ['name', 'short', 'description'],
      where: {
        short: options.genre.toLowerCase(),
      },
    });
  }
  if (options.platform) {
    includes.push({
      model: ctx.db.Platform,
      through: ctx.db.GamePlatform,
      attributes: ['name', 'short', 'description', 'properties'],
      where: {
        short: options.platform.toLowerCase(),
      },
    });
  }
  return await ctx.db.Game.findAll({
    attributes: ['title', 'released', 'links', 'properties'],
    include: includes,
    limit: 100,
  });
}

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
