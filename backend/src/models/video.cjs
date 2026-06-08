"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    static associate(models) {
      Video.belongsTo(models.User, {
        as: "creator",
        foreignKey: "createdByUserId",
      });
      Video.belongsTo(models.UserLanguage, {
        as: "languageFolder",
        foreignKey: "languageId",
      });
      Video.hasMany(models.Transcript, {
        as: "transcripts",
        foreignKey: "videoId",
      });
      Video.hasMany(models.VideoProgress, {
        as: "progress",
        foreignKey: "videoId",
      });
      Video.hasMany(models.Note, {
        as: "notes",
        foreignKey: "videoId",
      });
      Video.hasMany(models.VocabularyItem, {
        as: "vocabularyItems",
        foreignKey: "videoId",
      });
      Video.belongsToMany(models.Playlist, {
        through: models.PlaylistVideo,
        as: "playlists",
        foreignKey: "videoId",
        otherKey: "playlistId",
      });
    }
  }

  Video.init(
    {
      youtubeVideoId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      thumbnailUrl: DataTypes.STRING,
      channelTitle: DataTypes.STRING,
      durationSeconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      language: DataTypes.STRING,
      languageId: DataTypes.INTEGER,
      createdByUserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Video",
      tableName: "Videos",
    },
  );

  return Video;
};
