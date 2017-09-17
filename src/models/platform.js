'use strict';
module.exports = (sequelize, DataTypes) => {
  const Platform = sequelize.define('Platform', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    short: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    properties: {
      type: DataTypes.JSONB,
    },
  });
  Platform.associate = (models) => {
    Platform.belongsToMany(models.Game, {through: 'GamePlatforms'});
  };
  return Platform;
};
