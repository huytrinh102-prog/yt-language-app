"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      Playlist.belongsTo(models.User, {
        as: "user",
        foreignKey: "userId",
      });
      Playlist.belongsToMany(models.Video, {
        through: models.PlaylistVideo,
        as: "videos",
        foreignKey: "playlistId",
        otherKey: "videoId",
      });
    }
  }

  Playlist.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Playlist",
      tableName: "Playlists",
    },
  );

  return Playlist;
};
