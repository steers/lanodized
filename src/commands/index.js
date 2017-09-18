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
      let cmd = require(path.resolve(__dirname, file));
      client.commands.set(cmd.help.name, cmd);
      if (cmd.init) cmd.init(client);
      cmd.conf.aliases.forEach((alias) => {
        client.aliases.set(alias, cmd.help.name);
      });
    });
  return client;
};
