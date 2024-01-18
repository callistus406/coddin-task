import { NextFunction, Response } from "express";
import { logger } from "../../../config/winstonConfig";
import jwt from "jsonwebtoken";
import { RefreshTokenModel, UserModel } from "../../../model";
import { LoginValidator } from "../../../validation";
import { createCustomError } from "../../../middlewares/customError";
import { HashPassword, UnHashPassword } from "../../../shared/bcrypt";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  RESET_TOKEN_SECRET,
} from "../../../shared/constants";

class AuthController {
  static async login(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const requestId = res.getHeader("X-request-Id");
      const { email, password } = req.body;
      const cookies = req.cookies;
      const { error } = new LoginValidator({ email, password }).validate();
      if (error) throw createCustomError(error.message, 400);

      const foundUser = await UserModel.findOne({
        where: { email },
      });
      const userInfo = foundUser?.dataValues;
      if (!foundUser) {
        logger.error(`Authentication Error:  Invalid User: ${email} `, {
          module: "authenticationController.js",
          requestId: requestId,
          userId: req.user ? req.user.user_id : null,
          method: req.method,
          path: req.path,
          action: "Authentication",
          statusCode: 404,
          clientIp: req.clientIp,
        });

        throw createCustomError("Invalid Credential", 400);
      }

      const isValid = await new UnHashPassword(
        password,
        userInfo.hashed_password
      ).comparePassword();

      if (!isValid) {
        logger.warn(
          `Authentication Error: Failed password for  user ${foundUser.dataValues.first_name} with email ${email} `,
          {
            module: "authenticationController.js",
            requestId: requestId,
            userId: req.user ? req.user.user_id : null,
            method: req.method,
            path: req.path,
            action: "Authentication",
            statusCode: 401,
            clientIp: req.clientIp,
          }
        );

        throw createCustomError("Invalid Username or password", 400);
      }
      const payload = {
        email: userInfo.email,
        user_id: userInfo.user_id,
        is_verified: userInfo.is_verified,
        role: userInfo.user_type,
        firstName: userInfo.first_name,
        lastName: userInfo.last_name,
      };

      const accessToken = jwt.sign(
        {
          UserInfo: payload,
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "2d" }
      );

      const newRefreshToken = jwt.sign(
        {
          UserInfo: payload,
        },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      let newRefreshTokenArray = [];
      if (!cookies?.jwt) {
        newRefreshTokenArray = await RefreshTokenModel.findAll({
          where: { user_id: userInfo.user_id },
        });
      }
  

      if (cookies?.jwt) {
        const refreshToken = cookies.jwt;
        const foundToken = await RefreshTokenModel.findOne({
          where: { refresh_token: refreshToken },
        });
        console.log(foundToken);

        if (!foundToken) {
          RefreshTokenModel.destroy({
            where: {
              user_id: userInfo.userId,
            },
          });
        }
        res.clearCookie("jwt", { httpOnly: true, sameSite: "none" });
      }
      console.log(userInfo, "ppp");

      await RefreshTokenModel.create({
        refresh_token: newRefreshToken,
        user_id: userInfo.user_id,
      });

      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const response = {
        success: true,
        payload: {
          accessToken,
          ...payload,
        },
      };
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ==================================|| REFRESH TOKEN  CTRL ||===========================================

  static async refreshToken(
    req: any,
    res: Response,
    _next: NextFunction
  ): Promise<any> {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken: any = cookies.jwt;
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

    const foundUser = await RefreshTokenModel.findOne({
      where: { refresh_token: refreshToken },
      include: UserModel,
    });
    // Detected refresh token reuse!
    if (!foundUser) {
      jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
        async (err: any, decoded: any): Promise<any> => {
          if (err) return res.sendStatus(403); // Forbidden
          // Delete refresh tokens of hacked user

          await RefreshTokenModel.destroy({
            where: {
              user_id: decoded.user_id,
            },
          });
        }
      );
      return res.sendStatus(403); // Forbidden
    }

    // Evaluate jwt
    jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET,
      async (err: any, decoded: any) => {
        if (err) {
          // Expired refresh token

      

          await RefreshTokenModel.destroy({
            where: {
              user_id: foundUser.dataValues.user_id,
            },
          });
        }
        if (err || foundUser.dataValues.user_id.toString() !== decoded.user_id)
          return res.sendStatus(403);

        // Refresh token was still valid

        const payload = {
          email: foundUser.dataValues.email,
          user_id: foundUser.dataValues.user_id,
          role: foundUser.dataValues.user_type,
          is_verified: foundUser.dataValues.is_verified,
          firstName: foundUser.dataValues.firstName,
          lastName: foundUser.dataValues.lastName,
        };
        const accessToken = jwt.sign(
          {
            UserInfo: payload,
          },
          ACCESS_TOKEN_SECRET,
          { expiresIn: "30m" }
        );

        const newRefreshToken = jwt.sign(
          {
            UserInfo: payload,
          },
          REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        await RefreshTokenModel.create({
          refresh_token: refreshToken,
          user_id: foundUser.dataValues.user_id,
        });

        // Creates Secure Cookie with refresh token
        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: true,
        
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
          success: true,
          payload: {
            accessToken,
            ...payload,
          },
        });
      }
    );
  }

  static async logOut  (req: any, res: Response): Promise<any>  {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;
    // check if is in  refreshToken  db
    const foundUser = await RefreshTokenModel.findOne({
      where: { refresh_token: refreshToken },
      include: UserModel,
    });
    if (!foundUser) {
      res.clearCookie("jwt", { httpOnly: true, sameSite: "none" });
      return res.sendStatus(204);
    }
    // Delete refreshToken i
    await RefreshTokenModel.destroy({
      where: { refresh_token: refreshToken },
    });

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.sendStatus(204);
  };


}

export default AuthController;
