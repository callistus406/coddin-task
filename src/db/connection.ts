import { Sequelize } from "sequelize";
import { defineModels } from "../model";
import Helpers from "../shared/helpers";
import { createCustomError } from "../middlewares/customError";

interface IConnection {
  databaseName: string;
  databaseUsername: string;
  databasePassword: string;
  databaseHost: string | undefined;

  options: {
    host: string | undefined;
    dialect: any;
    logging: boolean;
    pool: {
      max: number;
      min: number;
      acquire: number;
      idle: number;
    };
    // dialectOptions:{

    // }
  };
}

// type connectType:
class CreateConnection {
  private sequelize: Sequelize;

  constructor(
    private databaseName: string,
    private databaseUsername: string,
    private databasePassword: string,
    private databaseHost: string,
    private options: any
  ) {
    this.sequelize = new Sequelize(
      databaseName,
      databaseUsername,
      databasePassword,
      options
    );
  }

  establishConnection() {
    const sequelize = new Sequelize(
      this.databaseName,
      this.databaseUsername,
      this.databasePassword,
      this.options
    );

    return sequelize;
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log("Connection has been established successfully.");

      defineModels(this.sequelize);

      await this.sequelize.sync({ force: false });
      console.log(" MYSQL tables created successfully ");

      const response = await Helpers.createAdmin({
        firstName: "admin",
        lastName: "admin user",
        email: "admin@gmail.com",
        password: "Admin123#",
      });
      if (!response)
        throw createCustomError("Unable to create admin user", 500);
      console.log(" Admin user created  ");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  }
}
export { CreateConnection };
