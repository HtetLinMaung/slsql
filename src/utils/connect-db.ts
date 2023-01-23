import { Dialect, Sequelize } from "sequelize";

export interface ConnectOptions {
  database: string;
  username: string;
  password: string;
  host?: string;
  port?: number;
  dialect: Dialect;
}

export default async function connectDb(connectOptions: ConnectOptions) {
  const { database, username, password, host, dialect } = connectOptions;
  let port = 0;
  if (!connectOptions.port) {
    switch (dialect) {
      case "postgres":
        port = 5432;
        break;
      case "mssql":
        port = 1433;
        break;
      case "mysql":
      case "mariadb":
        port = 3306;
        break;
    }
  } else {
    port = connectOptions.port;
  }

  const sequelize = new Sequelize(database, username, password, {
    host: host || "localhost",
    port,
    dialect,
    logging: false,
  });
  await sequelize.authenticate();
  return sequelize;
}
