import { CreateConnection } from "../db/connection";

import * as dotenv from "dotenv";

dotenv.config();

// const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST } = process.env;

const dbOptions = {
  DB_NAME: process.env.DB_NAME as string,
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_HOST: process.env.DB_HOST,

  options: {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};

const connInstance = new CreateConnection(
  dbOptions.DB_NAME as string,
  dbOptions.DB_USERNAME as string,
  dbOptions.DB_PASSWORD,
  dbOptions.DB_HOST as string,
  dbOptions.options
);

export { dbOptions, connInstance };
