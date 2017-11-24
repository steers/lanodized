'use strict';
module.exports = (sequelize, DataTypes) => {
  const DataFile = sequelize.define('DataFile', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    digest: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
  });
  return DataFile;
};
