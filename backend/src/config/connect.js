import db from "../models/index.cjs";

const connection = async () => {
  try {
    await db.sequelize.authenticate();
    const [[d]] = await db.sequelize.query("SELECT DATABASE() AS db");
    console.log("DB_IN_USE:", d);
    console.log("Connection has been established successfully.");
    return db.sequelize;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

export default connection;
