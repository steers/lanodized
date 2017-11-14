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
    DiscordInteraction.belongsTo(models.DiscordUser, {as: 'User'});
    DiscordInteraction.belongsTo(models.DiscordChannel, {as: 'Channel'});
    DiscordInteraction.belongsTo(models.DiscordGuild, {as: 'Guild'});
  };
  return DiscordInteraction;
};
