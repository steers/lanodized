'use strict';
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    released: {
      type: DataTypes.DATE,
    },
    links: {
      type: DataTypes.JSONB,
    },
    properties: {
      type: DataTypes.JSONB,
    },
  });
  Game.associate = (models) => {
    Game.hasMany(models.GameMode, {as: 'Modes'});
    Game.hasMany(models.GameAlias, {as: 'Aliases'});
    Game.belongsToMany(models.Genre, {through: models.GameGenre});
    Game.belongsToMany(models.Platform, {through: models.GamePlatform});
  };
  return Game;
};
