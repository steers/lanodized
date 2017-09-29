'use strict';
const {promisify} = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');
const basename = path.basename(module.filename);

/**
 * Create or update the given game definition in the
 * database, complete with aliases, game modes, genres
 * and platforms.
 *
 * @param  {Object} ctx Application context, including db instance.
 * @param  {Object} definition Complete game definition to sync.
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
      const modes = definition.modes.map((mode) => {
        return ctx.db.GameMode.upsert(Object.assign({
          GameId: game.id,
        }, mode), {
          transaction: t,
        });
      });
      return Promise.all(modes);
    }).then((created) => {
      ctx.log(`Upsert complete for: ${game.title}`);
    });
  });
}

async function initialize(ctx, client) {
  const ops = [];
  const games = await readdir(__dirname);
  games.filter((file) => {
    return (file.indexOf('.') !== 0)
        && (file !== basename)
        && (file.slice(-3) === '.js');
  }).forEach((file) => {
    let fullpath = path.resolve(__dirname, file);
    let game = require(fullpath);
    ops.push(upsertGame(ctx, game));
    delete require.cache[require.resolve(fullpath)];
  });
  await Promise.all(ops);
}

module.exports.initialize = initialize;
