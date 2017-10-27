'use strict';
const {promisify} = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');
const basename = path.basename(module.filename);
const {upsertGame} = require('../lib/games');

/**
 * Dynamically synchronize all game definitions with the database.
 * @param {Object} ctx Application context
 * @param {Object} ctx.db Database context
 * @return {undefined}
 */
async function initialize(ctx) {
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
