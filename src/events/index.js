'use strict';
const {promisify} = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');
const basename = path.basename(module.filename);

/**
 * Dynamically load all chat event handlers from their local definition files
 * and plug them into the given chat client object.
 * @param  {Object} ctx Application context
 * @param  {Bot} bot Chat bot instance
 */
async function initialize(ctx, bot) {
  const files = await readdir(__dirname);
  files.filter((file) => {
    return (file.indexOf('.') !== 0)
        && (file !== basename)
        && (file.slice(-3) === '.js');
  }).forEach((file) => {
    let name = file.split('.')[0];
    let fullpath = path.resolve(__dirname, file);
    let event = require(fullpath);
    bot.client.on(name, event.bind(null, ctx, bot));
    delete require.cache[require.resolve(fullpath)];
  });
}

module.exports.initialize = initialize;
