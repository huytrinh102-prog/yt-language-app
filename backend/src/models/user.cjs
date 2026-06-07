"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Group, { foreignKey: "groupId" });
      User.hasMany(models.UserLanguage, {
        as: "languages",
        foreignKey: "userId",
      });
      User.hasMany(models.Video, {
        as: "createdVideos",
        foreignKey: "createdByUserId",
      });
      User.hasMany(models.VideoProgress, {
        as: "videoProgress",
        foreignKey: "userId",
      });
      User.hasMany(models.Note, {
        as: "notes",
        foreignKey: "userId",
      });
      User.hasMany(models.VocabularyItem, {
        as: "vocabularyItems",
        foreignKey: "userId",
      });
      User.hasMany(models.Playlist, {
        as: "playlists",
        foreignKey: "userId",
      });
      User.hasMany(models.PasswordResetToken, {
        as: "passwordResetTokens",
        foreignKey: "userId",
      });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING,
      address: DataTypes.STRING,
      phone: DataTypes.STRING,
      sex: DataTypes.STRING,
      groupId: DataTypes.INTEGER,
      avatarUrl: DataTypes.STRING,
      avatarPublicId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
