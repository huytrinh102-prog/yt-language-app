"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PlaylistVideo extends Model {
    static associate(models) {
      PlaylistVideo.belongsTo(models.Playlist, {
        as: "playlist",
        foreignKey: "playlistId",
      });
      PlaylistVideo.belongsTo(models.Video, {
        as: "video",
        foreignKey: "videoId",
      });
    }
  }

  PlaylistVideo.init(
    {
      playlistId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      position: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "PlaylistVideo",
      tableName: "PlaylistVideos",
    },
  );

  return PlaylistVideo;
};
