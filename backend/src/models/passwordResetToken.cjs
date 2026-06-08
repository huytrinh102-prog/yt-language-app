"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PasswordResetToken extends Model {
    static associate(models) {
      PasswordResetToken.belongsTo(models.User, {
        as: "user",
        foreignKey: "userId",
      });
    }
  }

  PasswordResetToken.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "PasswordResetToken",
      tableName: "PasswordResetTokens",
    },
  );

  return PasswordResetToken;
};
