'use strict';
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    properties: {
      type: DataTypes.JSONB,
    },
  });
  Event.associate = (models) => {
    Event.belongsTo(models.EventType);
    Event.belongsTo(models.Party);
    Event.belongsToMany(models.Game, {through: 'EventGames'});
  };
  return Event;
};
