'use strict';
module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define('Genre', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    short: {
      primaryKey: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
  });
  Genre.associate = (models) => {
    Genre.belongsToMany(models.Game, {through: models.GameGenre});
  };
  return Genre;
};
