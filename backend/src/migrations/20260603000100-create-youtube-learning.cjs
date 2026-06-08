"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Videos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      youtubeVideoId: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      thumbnailUrl: {
        type: Sequelize.STRING,
      },
      channelTitle: {
        type: Sequelize.STRING,
      },
      durationSeconds: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      language: {
        type: Sequelize.STRING,
      },
      createdByUserId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "User",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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

    await queryInterface.createTable("Transcripts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      videoId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Videos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      language: {
        type: Sequelize.STRING,
      },
      source: {
        type: Sequelize.STRING,
      },
      segments: {
        type: Sequelize.JSON,
      },
      rawText: {
        type: Sequelize.TEXT("long"),
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

    await queryInterface.createTable("VideoProgress", {
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
      videoId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Videos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      watchedSeconds: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      completed: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      lastWatchedAt: {
        type: Sequelize.DATE,
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

    await queryInterface.createTable("Notes", {
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
      videoId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Videos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      timeSec: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      content: {
        allowNull: false,
        type: Sequelize.TEXT,
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

    await queryInterface.createTable("VocabularyItems", {
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
      videoId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Videos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      word: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      meaning: {
        type: Sequelize.TEXT,
      },
      example: {
        type: Sequelize.TEXT,
      },
      language: {
        type: Sequelize.STRING,
      },
      status: {
        allowNull: false,
        defaultValue: "new",
        type: Sequelize.STRING,
      },
      reviewAt: {
        type: Sequelize.DATE,
      },
      timesReviewed: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
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

    await queryInterface.createTable("Playlists", {
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
      description: {
        type: Sequelize.TEXT,
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

    await queryInterface.createTable("PlaylistVideos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      playlistId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Playlists",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      videoId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Videos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      position: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
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

    await queryInterface.addIndex("Videos", ["youtubeVideoId"], {
      unique: true,
      name: "videos_youtube_video_id_unique",
    });
    await queryInterface.addIndex("Transcripts", ["videoId", "language"], {
      name: "transcripts_video_language_idx",
    });
    await queryInterface.addIndex("VideoProgress", ["userId", "videoId"], {
      unique: true,
      name: "video_progress_user_video_unique",
    });
    await queryInterface.addIndex("Notes", ["userId", "videoId", "timeSec"], {
      name: "notes_user_video_time_idx",
    });
    await queryInterface.addIndex("VocabularyItems", ["userId", "word"], {
      name: "vocabulary_items_user_word_idx",
    });
    await queryInterface.addIndex("PlaylistVideos", ["playlistId", "videoId"], {
      unique: true,
      name: "playlist_videos_playlist_video_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("PlaylistVideos");
    await queryInterface.dropTable("Playlists");
    await queryInterface.dropTable("VocabularyItems");
    await queryInterface.dropTable("Notes");
    await queryInterface.dropTable("VideoProgress");
    await queryInterface.dropTable("Transcripts");
    await queryInterface.dropTable("Videos");
  },
};
