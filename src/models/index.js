'use strict';
const Sequelize = require('sequelize');
const {promisify} = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');
const basename = path.basename(module.filename);

const db = {};
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.json')[env];

const sequelize = (config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable])
  : new Sequelize(config.database, config.username, config.password, config));

async function initialize() {
  const files = await readdir(__dirname);
  files.filter((file) => {
    return (file.indexOf('.') !== 0)
        && (file !== basename)
        && (file.slice(-3) === '.js');
  }).forEach((file) => {
    let model = sequelize['import'](path.resolve(__dirname, file));
    db[model.name] = model;
  });
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
  return db;
}

module.exports.initialize = initialize;
