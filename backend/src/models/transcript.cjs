"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transcript extends Model {
    static associate(models) {
      Transcript.belongsTo(models.Video, {
        as: "video",
        foreignKey: "videoId",
      });
    }
  }

  Transcript.init(
    {
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      language: DataTypes.STRING,
      source: DataTypes.STRING,
      segments: DataTypes.JSON,
      rawText: DataTypes.TEXT("long"),
    },
    {
      sequelize,
      modelName: "Transcript",
      tableName: "Transcripts",
    },
  );

  return Transcript;
};
