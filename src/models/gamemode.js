'use strict';
module.exports = (sequelize, DataTypes) => {
  const GameMode = sequelize.define('GameMode', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    short: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serverSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    groupSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    properties: {
      type: DataTypes.JSONB,
    },
  });
  GameMode.associate = (models) => {
    GameMode.belongsTo(models.Game);
  };
  return GameMode;
};
