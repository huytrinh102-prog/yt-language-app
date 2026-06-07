"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // many-to-many  User
      Project.belongsToMany(models.User, {
        through: models.ProjectUser,
        as: "users",
        foreignKey: "projectId",
        otherKey: "userId",
      });

      // 1 project many todo
      Project.hasMany(models.Todo, {
        foreignKey: "projectId",
      });
    }
  }

  Project.init(
    {
      name: DataTypes.STRING,

      description: DataTypes.TEXT,

      status: {
        type: DataTypes.ENUM("PENDING", "ACTIVE", "COMPLETED", "CANCELLED"),
        defaultValue: "PENDING",
      },

      startDate: DataTypes.DATE,

      endDate: DataTypes.DATE,

      avatarUrl: DataTypes.STRING,

      avatarPublicId: DataTypes.STRING,
      createdBy: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Project",
    },
  );

  return Project;
};
