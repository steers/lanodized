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
    DiscordUser.hasMany(models.DiscordInteraction, {as: 'Interactions'});
  };
  return DiscordUser;
};
