'use strict';
module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define('Genre', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    short: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
  });
  Genre.associate = (models) => {
    Genre.belongsToMany(models.Game, {through: 'GameGenres'});
  };
  return Genre;
};
