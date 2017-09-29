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

async function initialize(ctx, client) {
  const files = await readdir(__dirname);
  const games = files.filter((file) => {
    return (file.indexOf('.') !== 0)
        && (file !== basename)
        && (file.slice(-3) === '.js');
  }).map((file) => {
    return require(path.resolve(__dirname, file));
  });
  for (const game of games) {
    await upsertGame(ctx, game);
  }
}

module.exports.initialize = initialize;
