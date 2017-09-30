'use strict';
module.exports = (sequelize, DataTypes) => {
  const GamePlatform = sequelize.define('GamePlatform', {});
  GamePlatform.associate = (models) => {
    GamePlatform.belongsTo(models.Game);
    GamePlatform.belongsTo(models.Platform);
  };
  return GamePlatform;
};
