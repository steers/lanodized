'use strict';
module.exports = (sequelize, DataTypes) => {
  const PollVote = sequelize.define('PollVote', {
    vote: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    outcome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
  PollVote.associate = (models) => {
    PollVote.belongsTo(models.Poll, {as: 'Poll'});
    PollVote.belongsTo(models.DiscordUser, {as: 'User'});
  };
  return PollVote;
};
