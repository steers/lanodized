'use strict';
module.exports = (sequelize, DataTypes) => {
  const GameAlias = sequelize.define('GameAlias', {
    name: {
      primaryKey: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  GameAlias.associate = (models) => {
    GameAlias.belongsTo(models.Game);
  };
  return GameAlias;
};
