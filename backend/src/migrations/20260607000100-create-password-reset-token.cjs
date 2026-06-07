"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PasswordResetTokens", {
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
      tokenHash: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      expiresAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      usedAt: {
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

    await queryInterface.addIndex("PasswordResetTokens", ["tokenHash"], {
      unique: true,
      name: "password_reset_token_hash_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("PasswordResetTokens");
  },
};
