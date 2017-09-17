'use strict';
module.exports = (sequelize, DataTypes) => {
  const GameAlias = sequelize.define('GameAlias', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });
  GameAlias.associate = (models) => {
    GameAlias.belongsTo(models.Game);
  };
  return GameAlias;
};
