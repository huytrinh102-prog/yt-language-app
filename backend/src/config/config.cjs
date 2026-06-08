require("dotenv").config();

const useDatabaseSsl =
  String(process.env.DB_SSL || "").toLowerCase() === "true" ||
  String(process.env.MYSQL_SSL || "").toLowerCase() === "true";

const baseConfig = {
  dialect: "mysql",
  logging: false,
  define: { freezeTableName: true },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    charset: "utf8mb4",
    ...(useDatabaseSsl
      ? {
          ssl: {
            minVersion: "TLSv1.2",
            rejectUnauthorized:
              String(process.env.DB_SSL_REJECT_UNAUTHORIZED || "true")
                .toLowerCase() !== "false",
          },
        }
      : {}),
  },
};

const fromEnv = {
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT || 3306),
};

const shouldUseDatabaseUrl =
  Boolean(process.env.DATABASE_URL || process.env.MYSQL_URL) ||
  process.env.NODE_ENV === "production" ||
  String(process.env.USE_DATABASE_URL || "").toLowerCase() === "true";

const databaseUrlEnv = shouldUseDatabaseUrl
  ? process.env.DATABASE_URL
    ? "DATABASE_URL"
    : process.env.MYSQL_URL
      ? "MYSQL_URL"
      : null
  : null;

const withUrlFallback = (config) => {
  if (databaseUrlEnv) {
    return { use_env_variable: databaseUrlEnv, ...baseConfig };
  }

  if (process.env.NODE_ENV === "production" && !config.host) {
    throw new Error(
      "Missing production database config. Set DATABASE_URL or MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE on Render.",
    );
  }

  return {
    ...config,
    ...baseConfig,
  };
};

module.exports = {
  development: withUrlFallback({
    username: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || null,
    database: process.env.MYSQLDATABASE || "yt_language_app",
    host: process.env.MYSQLHOST || "127.0.0.1",
    port: Number(process.env.MYSQLPORT || 3306),
  }),
  test: withUrlFallback({
    username: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || null,
    database: process.env.MYSQLDATABASE || "database_test",
    host: process.env.MYSQLHOST || "127.0.0.1",
    port: Number(process.env.MYSQLPORT || 3306),
  }),
  production: withUrlFallback(fromEnv),
};
