import pkg from "knex";

export const config: pkg.Knex.Config = {
  client: "sqlite",
  connection: {
    filename: "./db/app.db",
  },
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
  useNullAsDefault: true,
};

export const knex = pkg.knex(config);
