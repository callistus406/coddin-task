import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import {
  CustomError,
  createCustomError,
} from "../../../middlewares/customError";
import { RegistrationValidator } from "../../../validation/index";

import { logger } from "../../../config/winstonConfig";
import { UserModel } from "../../../model";
import { HashPassword } from "../../../shared/bcrypt";
import { USER_ROLE } from "../../../shared/constants";

class RegisterController {
  static async createAdmin(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { firstName, lastName, email, password } = req.body as {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
      };

      const validateData = {
        firstName,
        lastName,
        email,
        password,
      };

      const { error } = new RegistrationValidator(validateData).validate();

      if (error) throw createCustomError(error.message, 400);

      //   check if the user is already registered
      const user = await UserModel.findOne({
        where: { email },
      });
      if (user)
        throw createCustomError(
          "Sorry You can not use this email address, Please try another one. ",
          400
        );
      const hashedPassword = await new HashPassword(password).hash();

      // const newUser = await createUser(regData);

      const newUser = await UserModel.create({
        first_name: firstName,
        last_name: lastName,
        hashed_password: hashedPassword,
        email: email,
        is_verified: true,
        is_active: true,
        role: USER_ROLE,
      });

      if (!newUser)
        throw createCustomError(
          "Sorry Something went wrong, Please try again",
          500
        );

      return res.status(201).json({
        success: true,
        payload: "Your registration was successful!",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RegisterController;
