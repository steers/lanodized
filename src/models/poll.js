'use strict';
module.exports = (sequelize, DataTypes) => {
  const Poll = sequelize.define('Poll', {
    snowflake: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: true,
      },
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alternatives: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    opinion: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    outcome: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
  Poll.associate = (models) => {
    Poll.hasMany(models.PollVote, {as: 'Votes'});
    Poll.belongsTo(models.DiscordUser, {as: 'User'});
    Poll.belongsTo(models.DiscordChannel, {as: 'Channel'});
  };
  return Poll;
};
