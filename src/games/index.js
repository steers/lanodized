'use strict';
const fs = require('fs');
const path = require('path');
const basename = path.basename(module.filename);

/**
 * Create or update the given game definition in the
 * database, complete with aliases, game modes, genres
 * and platforms.
 *
 * @param  {Object} db Sequelize instance with models.
 * @param  {Object} definition Complete game definition to sync.
 * @return {Promise} Transaction containing the entire upsert.
 */
function upsertGame(db, definition) {
  return db.sequelize.transaction((t) => {
    let game;
    return db.Game.findOne({
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
        return db.Game.create(definition.info, {
          transaction: t,
        });
      }
    }).then((entity) => {
      game = entity;
      return Promise.all([
        db.Genre.findAll({
          transaction: t,
          where: {
            short: {
              $in: definition.genres,
            },
          },
        }),
        db.Platform.findAll({
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
        return db.GameAlias.upsert({
          name: alias,
          GameId: game.id,
        }, {
          transaction: t,
        });
      });
      return Promise.all(aliases);
    }).then((created) => {
      const modes = definition.modes.map((mode) => {
        return db.GameMode.upsert(Object.assign({
          GameId: game.id,
        }, mode), {
          transaction: t,
        });
      });
      return Promise.all(modes);
    }).then((created) => {
      console.log(`Upsert complete for: ${game.name}`);
    });
  });
}

module.exports = {
  initialize: (db) => {
    const ops = [];
    fs
      .readdirSync(__dirname)
      .filter((file) => {
        return (file.indexOf('.') !== 0)
            && (file !== basename)
            && (file.slice(-3) === '.js');
      })
      .forEach((file) => {
        let game = require(path.resolve(__dirname, file));
        ops.push(upsertGame(db, game));
        delete require.cache[require.resolve(path.resolve(__dirname, file))];
      });
    return Promise.all(ops);
  },
};
