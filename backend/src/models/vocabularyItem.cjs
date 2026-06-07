"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VocabularyItem extends Model {
    static associate(models) {
      VocabularyItem.belongsTo(models.User, {
        as: "user",
        foreignKey: "userId",
      });
      VocabularyItem.belongsTo(models.Video, {
        as: "video",
        foreignKey: "videoId",
      });
    }
  }

  VocabularyItem.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      videoId: DataTypes.INTEGER,
      word: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meaning: DataTypes.TEXT,
      example: DataTypes.TEXT,
      language: DataTypes.STRING,
      status: {
        type: DataTypes.STRING,
        defaultValue: "new",
      },
      reviewAt: DataTypes.DATE,
      timesReviewed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "VocabularyItem",
      tableName: "VocabularyItems",
    },
  );

  return VocabularyItem;
};
