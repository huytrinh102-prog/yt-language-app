module.exports = {
  async up(queryInterface, Sequelize) {
    // TODO
    await queryInterface.addColumn("Todos", "deadline", {
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Project", "createdBy");
  },
};
