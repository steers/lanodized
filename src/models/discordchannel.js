'use strict';
module.exports = (sequelize, DataTypes) => {
  const DiscordChannel = sequelize.define('DiscordChannel', {
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
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  DiscordChannel.associate = (models) => {
    DiscordChannel.belongsTo(models.DiscordGuild, {as: 'Guild'});
    DiscordChannel.hasMany(models.DiscordInteraction, {as: 'Interactions', foreignKey: 'ChannelId'});
    DiscordChannel.hasMany(models.Poll, {foreignKey: 'ChannelId'});
  };
  return DiscordChannel;
};
