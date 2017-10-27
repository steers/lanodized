'use strict';

/**
 * Retrieve the game with the given name, or as close to it as possible.
 * @param {Object} ctx Application context
 * @param {Object} ctx.db Database context
 * @param {string} name Game name query
 * @return {Object} Result of name query on alias or title, or null
 */
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

/**
 * Retrieve a set of games with the provided characteristics.
 * @param {Object} ctx Application context
 * @param {Object} ctx.db Database context
 * @param {Object} options Filter arguments
 * @param {string} options.genre Game genre query
 * @param {string} options.platform Game platform query
 * @return {Object[]} Up to 100 games matching the given query
 */
async function findGames(ctx, options) {
  const includes = [];
  const filter = options || {};
  if (filter.genre) {
    includes.push({
      model: ctx.db.Genre,
      through: ctx.db.GameGenre,
      attributes: ['name', 'short', 'description'],
      where: {
        short: filter.genre.toLowerCase(),
      },
    });
  }
  if (filter.platform) {
    includes.push({
      model: ctx.db.Platform,
      through: ctx.db.GamePlatform,
      attributes: ['name', 'short', 'description', 'properties'],
      where: {
        short: filter.platform.toLowerCase(),
      },
    });
  }
  return await ctx.db.Game.findAll({
    attributes: ['title', 'released', 'links', 'properties'],
    include: includes,
    limit: 100,
  });
}

/**
 * Create or update the given game definition in the database, complete
 * with aliases, game modes, genres and platforms.
 * @param {Object} ctx Application context, including db instance.
 * @param {Object} definition Complete game definition to sync.
 * @return {Promise} Transaction containing the entire upsert.
 */
function upsertGame(ctx, definition) {
  return ctx.db.sequelize.transaction((t) => {
    let game;
    return ctx.db.Game.findOne({
      transaction: t,
      where: {
        title: definition.info.title,
      },
    }).then((entity) => {
      if (entity) {
        return entity.update(definition.info, {
          transaction: t,
        });
      } else {
        return ctx.db.Game.create(definition.info, {
          transaction: t,
        });
      }
    }).then((entity) => {
      game = entity;
      return Promise.all([
        ctx.db.Genre.findAll({
          transaction: t,
          where: {
            short: {
              $in: definition.genres,
            },
          },
        }),
        ctx.db.Platform.findAll({
          transaction: t,
          where: {
            short: {
              $in: definition.platforms,
            },
          },
        }),
      ]);
    }).then(([genres, platforms]) => {
      game.setGenres(genres);
      game.setPlatforms(platforms);
      return game.save({transaction: t});
    }).then((entity) => {
      const aliases = definition.aliases.map((alias) => {
        return ctx.db.GameAlias.upsert({
          name: alias,
          GameId: game.id,
        }, {
          transaction: t,
        });
      });
      return Promise.all(aliases);
    }).then((created) => {
      return ctx.db.GameMode.findAll({
        transaction: t,
        where: {
          GameId: game.id,
        },
      });
    }).then((modes) => {
      const ops = [];
      const existing = new Set();
      modes.forEach((mode) => {
        let defined = definition.modes.find((def) => {
          return def.short === mode.short;
        });
        if (defined) {
          ops.push(mode.update(defined, {
            transaction: t,
          }));
        }
        existing.add(mode.short);
      });
      definition.modes.filter((mode) => {
        return !existing.has(mode.short);
      }).forEach((mode) => {
        ops.push(ctx.db.GameMode.create(Object.assign({
          GameId: game.id,
        }, mode, {
          transaction: t,
        })));
      });
      return Promise.all(ops);
    });
  }).then(() => {
    ctx.log(`Upsert completed for ${definition.info.title}`);
  }).catch((err) => {
    ctx.log(`An error occurred in the upsert transaction for ${definition.info.title}`, err);
  });
}

module.exports = {
  findGameFromName,
  findGames,
  upsertGame,
};
