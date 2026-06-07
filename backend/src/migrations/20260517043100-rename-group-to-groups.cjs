"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes("Group")) {
      await queryInterface.renameTable("Group", "Groups");
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();

    if (tables.includes("Groups")) {
      await queryInterface.renameTable("Groups", "Group");
    }
  },
};
