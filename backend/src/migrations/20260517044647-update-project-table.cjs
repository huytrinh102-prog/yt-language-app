"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Project", "ProjectName", "name");

    await queryInterface.renameColumn("Project", "desciption", "description");

    await queryInterface.removeColumn("Project", "CustomerId");

    await queryInterface.addColumn("Project", "status", {
      type: Sequelize.STRING,
      defaultValue: "PENDING",
    });

    await queryInterface.addColumn("Project", "endDate", {
      type: Sequelize.DATE,
    });

    await queryInterface.addColumn("Project", "avatarUrl", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("Project", "avatarPublicId", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {},
};
