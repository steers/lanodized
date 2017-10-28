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
  const includes = [{
    model: ctx.db.GameAlias,
    as: 'Aliases',
    attributes: ['name'],
  }];
  if (alias) {
    game = await alias.getGame({
      attributes: attrs,
      include: includes,
    });
  } else {
    game = await ctx.db.Game.findOne({
      attributes: attrs,
      include: includes,
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
  const filter = options || {};
  const includes = [{
    model: ctx.db.GameAlias,
    as: 'Aliases',
    attributes: ['name'],
  }];
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
        $or: {
          short: filter.platform.toLowerCase(),
          properties: {
            type: {
              $iLike: filter.platform,
            },
          },
        },
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
 * Create or update the given game definition in the database.
 * @param {Object} ctx Application context, including db instance.
 * @param {Object} definition Complete game definition to sync.
 * @return {Promise}
 */
function upsertGame(ctx, definition) {
  return ctx.db.sequelize.transaction((t) => {
    return ctx.db.Game.findOne({
      transaction: t,
      where: {
        title: definition.info.title,
      },
    }).then((game) => {
      if (game) {
        return game.update(definition.info, {
          transaction: t,
        });
      } else {
        return ctx.db.Game.create(definition.info, {
          transaction: t,
        });
      }
    });
  }).then((game) => {
    return upsertGameGenres(ctx, definition, game);
  }).then((game) => {
    return upsertGamePlatforms(ctx, definition, game);
  }).then((game) => {
    return Promise.all([
      upsertGameAliases(ctx, definition, game.id),
      upsertGameModes(ctx, definition, game.id),
    ]);
  }).then(() => {
    ctx.log(`Upsert completed for ${definition.info.title}`);
  }).catch((err) => {
    ctx.log(`An error occurred in the upsert transaction for ${definition.info.title}`, err);
  });
}

/**
 * Associate the given game with its defined genres in the database.
 * @param {Object} ctx Application context, including db instance.
 * @param {Object} definition Complete game definition to sync.
 * @param {Object} game Game entity to update
 * @return {Promise}
 */
function upsertGameGenres(ctx, definition, game) {
  return ctx.db.Genre.findAll({
    where: {
      short: {
        $in: definition.genres,
      },
    },
  }).then((genres) => {
    game.setGenres(genres);
    return game.save();
  });
}

/**
 * Associate the given game with its defined platforms in the database.
 * @param {Object} ctx Application context, including db instance.
 * @param {Object} definition Complete game definition to sync.
 * @param {Object} game Game entity to update
 * @return {Promise}
 */
function upsertGamePlatforms(ctx, definition, game) {
  return ctx.db.Platform.findAll({
    where: {
      short: {
        $in: definition.platforms,
      },
    },
  }).then((platforms) => {
    game.setPlatforms(platforms);
    return game.save();
  });
}

/**
 * Synchronize the modes defined for a game with what's in the database.
 * @param {Object} ctx Application context, including db instance.
 * @param {Object} definition Complete game definition to sync.
 * @param {number} gameId Game entity ID corresponding to the defined modes
 * @return {Promise}
 */
function upsertGameModes(ctx, definition, gameId) {
  return ctx.db.sequelize.transaction((t) => {
    return ctx.db.GameMode.findAll({
        transaction: t,
        where: {
          $and: {
            GameId: gameId,
            short: {
              $in: definition.modes.map((mode) => mode.short),
            },
          },
        },
    }).then((modes) => {
      return Promise.all(definition.modes.map((defn) => {
        const mode = modes.find((existing) => {
          return existing.short === defn.short;
        });
        if (mode) {
          return mode.update(defn, {
            transaction: t,
          });
        } else {
          const addition = Object.assign({GameId: gameId}, defn);
          return ctx.db.GameMode.create(addition, {
            transaction: t,
          });
        }
      }));
    });
  });
}

/**
 * Associate the given game with its defined aliases in the database.
 * @param {Object} ctx Application context, including db instance.
 * @param {Object} definition Complete game definition to sync.
 * @param {number} gameId Game entity ID corresponding to the defined aliases
 * @return {Promise}
 */
function upsertGameAliases(ctx, definition, gameId) {
  return ctx.db.sequelize.transaction((t) => {
    return Promise.all(definition.aliases.map((alias) => {
      return ctx.db.GameAlias.upsert({
        name: alias,
        GameId: gameId,
      }, {
        transaction: t,
      });
    }));
  });
}

module.exports = {
  findGameFromName,
  findGames,
  upsertGame,
};
