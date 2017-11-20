'use strict';
module.exports = (sequelize, DataTypes) => {
  const DiscordUser = sequelize.define('DiscordUser', {
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
    properties: {
      type: DataTypes.JSONB,
    },
  });
  DiscordUser.associate = (models) => {
    DiscordUser.hasMany(models.DiscordInteraction, {as: 'Interactions', foreignKey: 'UserId'});
    DiscordUser.hasMany(models.PollVote, {as: 'Votes', foreignKey: 'UserId'});
    DiscordUser.hasMany(models.Poll, {foreignKey: 'UserId'});
    DiscordUser.hasMany(models.Notification, {foreignKey: 'CreatorId'});
  };
  return DiscordUser;
};
