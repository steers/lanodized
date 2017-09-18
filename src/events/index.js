'use strict';
const fs = require('fs');
const path = require('path');
const basename = path.basename(module.filename);

module.exports = (client) => {
  fs
    .readdirSync(__dirname)
    .filter((file) => {
      return (file.indexOf('.') !== 0)
          && (file !== basename)
          && (file.slice(-3) === '.js');
    })
    .forEach((file) => {
      let name = file.split('.')[0];
      let event = require(path.resolve(__dirname, file));
      client.on(name, event.bind(null, client));
      delete require.cache[require.resolve(path.resolve(__dirname, file))];
    });
  return client;
};
