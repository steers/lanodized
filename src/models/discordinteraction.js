'use strict';
module.exports = (sequelize, DataTypes) => {
  const DiscordInteraction = sequelize.define('DiscordInteraction', {
    command: {
      type: DataTypes.STRING,
    },
    alias: {
      type: DataTypes.STRING,
    },
    properties: {
      type: DataTypes.JSONB,
    },
  });
  DiscordInteraction.associate = (models) => {
    DiscordInteraction.hasOne(models.DiscordUser, {as: 'User'});
    DiscordInteraction.hasOne(models.DiscordChannel, {as: 'Channel'});
    DiscordInteraction.hasOne(models.DiscordGuild, {as: 'Guild'});
  };
  return DiscordInteraction;
};
