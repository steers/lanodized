'use strict';
module.exports = (sequelize, DataTypes) => {
  const Platform = sequelize.define('Platform', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    short: {
      primaryKey: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    properties: {
      type: DataTypes.JSONB,
    },
  });
  Platform.associate = (models) => {
    Platform.belongsToMany(models.Game, {through: models.GamePlatform});
  };
  return Platform;
};
