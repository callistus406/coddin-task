import dotenv from "dotenv";

import { NextFunction, Response } from "express";

import jwt from "jsonwebtoken";

dotenv.config();

const ACCESS_TOKEN_SECRET: string = process.env.ACCESS_TOKEN_SECRET as string;

export const verifyJWT = (req: any, res: Response, next: NextFunction): any => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    ACCESS_TOKEN_SECRET,
    (err: Error | null, decoded: any): any => {
      if (err) return res.sendStatus(403);

      req.user = decoded.UserInfo;

      next();
    }
  );
};
