'use strict';
module.exports = (sequelize, DataTypes) => {
  const EventGameMode = sequelize.define('EventGameMode', {});
  EventGameMode.associate = (models) => {
    EventGameMode.belongsTo(models.Event);
    EventGameMode.belongsTo(models.GameMode);
  };
  return EventGameMode;
};
