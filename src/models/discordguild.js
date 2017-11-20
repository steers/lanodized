'use strict';
module.exports = (sequelize, DataTypes) => {
  const DiscordGuild = sequelize.define('DiscordGuild', {
    snowflake: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    connectedAt: {
      type: DataTypes.DATE,
    },
  });
  DiscordGuild.associate = (models) => {
    DiscordGuild.hasMany(models.DiscordInteraction, {as: 'Interactions', foreignKey: 'GuildId'});
    DiscordGuild.hasMany(models.Notification, {foreignKey: 'GuildId'});
  };
  return DiscordGuild;
};
