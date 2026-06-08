"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VideoProgress extends Model {
    static associate(models) {
      VideoProgress.belongsTo(models.User, {
        as: "user",
        foreignKey: "userId",
      });
      VideoProgress.belongsTo(models.Video, {
        as: "video",
        foreignKey: "videoId",
      });
    }
  }

  VideoProgress.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      watchedSeconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      lastWatchedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "VideoProgress",
      tableName: "VideoProgress",
    },
  );

  return VideoProgress;
};
