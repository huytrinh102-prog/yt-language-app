"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const adminPassword = await bcrypt.hash("admin123456", 10);

    await queryInterface.bulkInsert(
      "Groups",
      [
        {
          id: 1,
          name: "admin",
          description: "System administrator",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 2,
          name: "user",
          description: "Default learner account",
          createdAt: now,
          updatedAt: now,
        },
      ],
      { updateOnDuplicate: ["name", "description", "updatedAt"] },
    );

    await queryInterface.bulkInsert(
      "Role",
      [
        {
          id: 1,
          url: "api/v1/videos",
          description: "Use video learning APIs",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 2,
          url: "api/v1/vocabulary",
          description: "Use vocabulary APIs",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 3,
          url: "api/v1/notes",
          description: "Use note APIs",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 4,
          url: "api/v1/languages",
          description: "Use language folder APIs",
          createdAt: now,
          updatedAt: now,
        },
      ],
      { updateOnDuplicate: ["url", "description", "updatedAt"] },
    );

    await queryInterface.bulkDelete("GroupRole", { groupId: 2 });

    await queryInterface.bulkInsert(
      "GroupRole",
      [
        {
          groupId: 2,
          RoleId: 1,
          createdAt: now,
          updatedAt: now,
        },
        {
          groupId: 2,
          RoleId: 2,
          createdAt: now,
          updatedAt: now,
        },
        {
          groupId: 2,
          RoleId: 3,
          createdAt: now,
          updatedAt: now,
        },
        {
          groupId: 2,
          RoleId: 4,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      "User",
      [
        {
          id: 1,
          email: "admin@gmail.com",
          password: adminPassword,
          username: "admin",
          phone: "0000000000",
          sex: "OTHER",
          groupId: 1,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {
        updateOnDuplicate: [
          "email",
          "password",
          "username",
          "phone",
          "sex",
          "groupId",
          "updatedAt",
        ],
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("User", { email: "admin@gmail.com" });
    await queryInterface.bulkDelete("GroupRole", { groupId: 2 });
    await queryInterface.bulkDelete("Role", { id: [1, 2, 3, 4] });
    await queryInterface.bulkDelete("Groups", { id: [1, 2] });
  },
};
