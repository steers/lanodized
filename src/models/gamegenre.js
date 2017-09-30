'use strict';
module.exports = (sequelize, DataTypes) => {
  const GameGenre = sequelize.define('GameGenre', {});
  GameGenre.associate = (models) => {
    GameGenre.belongsTo(models.Game);
    GameGenre.belongsTo(models.Genre);
  };
  return GameGenre;
};
