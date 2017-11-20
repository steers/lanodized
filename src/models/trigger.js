'use strict';
module.exports = (sequelize, DataTypes) => {
  const Trigger = sequelize.define('Trigger', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    properties: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  });
  Trigger.associate = (models) => {
    Trigger.hasMany(models.Notification);
  };
  return Trigger;
};
