'use strict';
module.exports = (sequelize, DataTypes) => {
  const Party = sequelize.define('Party', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    iteration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {min: 1},
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
  Party.associate = (models) => {
    Party.hasMany(models.Event);
  };
  return Party;
};
