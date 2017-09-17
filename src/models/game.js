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
    Game.belongsToMany(models.Genre, {through: 'GameGenres'});
    Game.belongsToMany(models.Platform, {through: 'GamePlatforms'});
  };
  return Game;
};
