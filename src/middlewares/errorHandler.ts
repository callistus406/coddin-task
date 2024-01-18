import { logger } from "../config/winstonConfig";
import { CustomError } from "./customError";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof CustomError) {
    return res
      .status(error.statusCode)
      .json({ success: false, payload: error.message });
  }

  logger.error(` ${error.message}`, {
    module: "errorHandler.js",
    method: req.method,
    path: req.path,
    action: "Error log",
    statusCode: 500,
  });
  return res.status(500).json({
    success: false,
    payload:
      "I apologize for the inconvenience. Our technical team is actively working to resolve the issue with our server. Thank you for your patience. ",
  });
};
