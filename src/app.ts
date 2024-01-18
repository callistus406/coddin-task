import dotenv from "dotenv";
import express from "express";
import routes from "./api/v1";
import cookieParser from "cookie-parser";
import { connInstance } from "./db/configParams";
import { handleCustomError } from "./middlewares/customError";
import { logger } from "./config/winstonConfig";
dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);

app.use(handleCustomError as any);

const startApp = async () => {
  try {
    await connInstance.connect();

    app.listen(PORT, () => {
      console.log(`app server is running on port ${PORT}`);
      logger.info(`Server startup successful  `, {
        module: "authenticationController.js",
        action: "Server Initialization",
        statusCode: 200,
        date: new Date(),
      });
    });
  } catch (error) {
    logger.error(`${error}  `, {
      module: "authenticationController.js",
      action: "Server Initialization",
      statusCode: 500,
    });
  }
};

startApp();
