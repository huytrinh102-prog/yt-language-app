"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    static associate(models) {
      Note.belongsTo(models.User, {
        as: "user",
        foreignKey: "userId",
      });
      Note.belongsTo(models.Video, {
        as: "video",
        foreignKey: "videoId",
      });
    }
  }

  Note.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      timeSec: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Note",
      tableName: "Notes",
    },
  );

  return Note;
};
