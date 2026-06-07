"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserLanguage extends Model {
    static associate(models) {
      UserLanguage.belongsTo(models.User, {
        as: "user",
        foreignKey: "userId",
      });
      UserLanguage.hasMany(models.Video, {
        as: "videos",
        foreignKey: "languageId",
      });
    }
  }

  UserLanguage.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: DataTypes.STRING,
      description: DataTypes.TEXT,
      color: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserLanguage",
      tableName: "UserLanguages",
    },
  );

  return UserLanguage;
};
