"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tablesRaw = await queryInterface.showAllTables();
    const tables = new Set(
      (tablesRaw || []).map((t) => (typeof t === "string" ? t : t.tableName)),
    );

    // Legacy: earlier migration created "GroupUser" but models expect "ProjectUser"
    if (tables.has("GroupUser") && !tables.has("ProjectUser")) {
      await queryInterface.renameTable("GroupUser", "ProjectUser");
    }

    // Legacy: some setups used pluralized table name
    if (tables.has("Users") && !tables.has("User")) {
      await queryInterface.renameTable("Users", "User");
    }
  },

  async down(queryInterface) {
    const tablesRaw = await queryInterface.showAllTables();
    const tables = new Set(
      (tablesRaw || []).map((t) => (typeof t === "string" ? t : t.tableName)),
    );

    if (tables.has("ProjectUser") && !tables.has("GroupUser")) {
      await queryInterface.renameTable("ProjectUser", "GroupUser");
    }

    if (tables.has("User") && !tables.has("Users")) {
      await queryInterface.renameTable("User", "Users");
    }
  },
};

