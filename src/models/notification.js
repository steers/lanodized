'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    target: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  });
  Notification.associate = (models) => {
    Notification.belongsTo(models.Trigger);
    Notification.belongsTo(models.DiscordGuild, {as: 'Guild'});
    Notification.belongsTo(models.DiscordUser, {as: 'Creator'});
  };
  return Notification;
};
