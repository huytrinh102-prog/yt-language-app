"use strict";

const getTableNames = async (queryInterface) => {
  const tablesRaw = await queryInterface.showAllTables();
  return new Set(
    (tablesRaw || []).map((table) =>
      typeof table === "string" ? table : table.tableName,
    ),
  );
};

const removeIndexIfExists = async (queryInterface, tableName, indexName) => {
  const indexes = await queryInterface.showIndex(tableName);
  if (indexes.some((index) => index.name === indexName)) {
    await queryInterface.removeIndex(tableName, indexName);
  }
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await getTableNames(queryInterface);

    if (!tables.has("UserLanguages")) {
      await queryInterface.createTable("UserLanguages", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        userId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: "User",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        code: {
          type: Sequelize.STRING,
        },
        description: {
          type: Sequelize.TEXT,
        },
        color: {
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }

    const videosDescription = await queryInterface.describeTable("Videos");
    if (!videosDescription.languageId) {
      await queryInterface.addColumn("Videos", "languageId", {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "UserLanguages",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }

    await removeIndexIfExists(queryInterface, "Videos", "youtubeVideoId");
    await removeIndexIfExists(
      queryInterface,
      "Videos",
      "videos_youtube_video_id_unique",
    );

    await queryInterface.addIndex(
      "UserLanguages",
      ["userId", "name"],
      {
        unique: true,
        name: "user_languages_user_name_unique",
      },
    );
    await queryInterface.addIndex("Videos", ["createdByUserId", "languageId"], {
      name: "videos_creator_language_idx",
    });
    await queryInterface.addIndex(
      "Videos",
      ["createdByUserId", "languageId", "youtubeVideoId"],
      {
        unique: true,
        name: "videos_creator_language_youtube_unique",
      },
    );

    const tablesAfterLanguage = await getTableNames(queryInterface);
    if (tablesAfterLanguage.has("ProjectUser")) {
      await queryInterface.dropTable("ProjectUser");
    }
    if (tablesAfterLanguage.has("Todos")) {
      await queryInterface.dropTable("Todos");
    }
    if (tablesAfterLanguage.has("Project")) {
      await queryInterface.dropTable("Project");
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = await getTableNames(queryInterface);

    if (tables.has("Videos")) {
      await removeIndexIfExists(
        queryInterface,
        "Videos",
        "videos_creator_language_youtube_unique",
      );
      await removeIndexIfExists(
        queryInterface,
        "Videos",
        "videos_creator_language_idx",
      );

      const videosDescription = await queryInterface.describeTable("Videos");
      if (videosDescription.languageId) {
        await queryInterface.removeColumn("Videos", "languageId");
      }

      await queryInterface.addIndex("Videos", ["youtubeVideoId"], {
        unique: true,
        name: "videos_youtube_video_id_unique",
      });
    }

    if (tables.has("UserLanguages")) {
      await queryInterface.dropTable("UserLanguages");
    }

    if (!tables.has("Project")) {
      await queryInterface.createTable("Project", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
        },
        description: {
          type: Sequelize.STRING,
        },
        startDate: {
          type: Sequelize.STRING,
        },
        status: {
          type: Sequelize.STRING,
          defaultValue: "PENDING",
        },
        endDate: {
          type: Sequelize.DATE,
        },
        avatarUrl: {
          type: Sequelize.STRING,
        },
        avatarPublicId: {
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }

    if (!tables.has("Todos")) {
      await queryInterface.createTable("Todos", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        title: Sequelize.STRING,
        description: Sequelize.TEXT,
        status: Sequelize.STRING,
        priority: Sequelize.STRING,
        dueDate: Sequelize.DATE,
        deadline: Sequelize.DATE,
        imageUrl: Sequelize.STRING,
        imagePublicId: Sequelize.STRING,
        userId: Sequelize.INTEGER,
        projectId: Sequelize.INTEGER,
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }

    if (!tables.has("ProjectUser")) {
      await queryInterface.createTable("ProjectUser", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        projectId: Sequelize.INTEGER,
        userId: Sequelize.INTEGER,
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }
  },
};
