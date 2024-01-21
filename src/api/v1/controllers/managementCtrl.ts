import { NextFunction, Response } from "express";
import { createCustomError } from "../../../middlewares/customError";
import { RegistrationValidator } from "../../../validation";
import { RoleModel, UserModel } from "../../../model";
import { HashPassword } from "../../../shared/bcrypt";
import Helpers from "../../../shared/helpers";
import { EMPLOYEE_ROLE } from "../../../shared/constants";
import { logger } from "../../../config/winstonConfig";

class EmployeeController {
  static createEmployee = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const requestId = res.getHeader("X-request-Id");

      const { firstName, lastName, email, role, password } = req.body as {
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        password: string;
      };

      const validateData = {
        firstName,
        lastName,
        email,
        password,
      };
      const { error } = new RegistrationValidator(validateData).validate();
      if (!Helpers.checkRole(role))
        throw createCustomError("invalid role", 400);

      if (error) throw createCustomError(error.message, 400);
      const user = await UserModel.findOne({
        where: { email },
      });
      if (user)
        throw createCustomError(
          "Sorry You can not use this email address, Please try another one. ",
          400
        );
      const hashedPassword = await new HashPassword(password).hash();
      const newUser = await UserModel.create({
        first_name: firstName,
        last_name: lastName,
        hashed_password: hashedPassword,
        email: email,
        user_type: EMPLOYEE_ROLE,
        is_verified: true,
        is_active: true,
      });

      if (newUser) {
        const response = await RoleModel.create({
          title: role,
          code: Helpers.convertRole(role),
          user_id: newUser.dataValues.user_id,
        });
        if (!response) {
          logger.error(`Database Error: Unable to create Job role  `, {
            module: "managementCtrl.js",
            requestId: requestId,
            userId: req.user ? req.user.user_id : null,
            method: req.method,
            path: req.path,
            action: "Create Job role",
            statusCode: 500,
            clientIp: req.clientIp,
          });
          throw createCustomError(
            "Sorry Something went wrong, Please try again",
            500
          );
        }
      } else {
        logger.error(
          `Database Error: Unable to create employee  with ${email} `,
          {
            module: "managementCtrl.js",
            requestId: requestId,
            userId: req.user ? req.user.user_id : null,
            method: req.method,
            path: req.path,
            action: "Create account",
            statusCode: 500,
            clientIp: req.clientIp,
          }
        );
        throw createCustomError(
          "Sorry Something went wrong, Please try again",
          500
        );
      }

      return res.status(201).json({
        success: true,
        payload: " registration was successful!",
      });
    } catch (error) {
      next(error);
    }
  };

  static getEmployee = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const { userId, email } = req.query;
      let response;
      if (userId && !email) {
        response = await UserModel.findOne({
          where: { user_id: userId, user_type: EMPLOYEE_ROLE },
          include: RoleModel,
        });
      } else if (!userId && email) {
        response = await UserModel.findOne({
          where: { email, user_type: EMPLOYEE_ROLE },
          include: RoleModel,
        });
      } else {
        throw createCustomError(
          "Sorry. you only provide one search value( email or ID)",
          400
        );
      }

      if (!response)
        throw createCustomError(
          `Employee not found.Please try another ${email ? "Email " : "ID"}`,
          404
        );

      return res.status(200).json({
        success: true,
        payload: response.dataValues,
        message: "Employee  details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  static getEmployees = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const response = await UserModel.findAll({
        where: { user_type: EMPLOYEE_ROLE },
        include: RoleModel,
      });

      if (response.length === 0)
        throw createCustomError("No employees found", 404);

      return res.status(200).json({
        success: true,
        payload: response,
        hits: response.length,
        message: "Employees  details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  static deleteEmployee = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const requestId = res.getHeader("X-request-Id");

      const employeeId = req.params.employeeId;
      const foundEmployee = await UserModel.findOne({
        where: { user_id: employeeId, user_type: EMPLOYEE_ROLE },
      });
      if (!foundEmployee) throw createCustomError("Employee not found", 404);
      const numberOfDeletedRows = await UserModel.destroy({
        where: { user_id: employeeId },
      });

      if (numberOfDeletedRows < 1) {
        logger.error(`Database Error: Unable to delete employee  `, {
          module: "managementCtrl.js",
          requestId: requestId,
          userId: req.user ? req.user.user_id : null,
          method: req.method,
          path: req.path,
          action: "Delete Employee",
          statusCode: 500,
          clientIp: req.clientIp,
        });
        throw createCustomError("Unable to delete record", 500);
      }
      return res
        .status(200)
        .json({ success: true, payload: "Employee deleted" });
    } catch (error) {
      next(error);
    }
  };

  static async updateEmployee(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { status, email } = req.body as { status: string; email: string };
      if (!status)
        throw createCustomError("Please provide employee status", 400);
      if (
        status.toLocaleLowerCase() !== "employed" ||
        status.toLocaleLowerCase() !== "fired"
      )
        throw createCustomError("Please provide a valid status value", 400);
      const response = await UserModel.update(
        { is_active: Helpers.employeeStatusConverter(status) },
        { where: { user_type: EMPLOYEE_ROLE, email } }
      );
      if (!response[0])
        throw createCustomError("Unable to update Employee", 500);

      return res
        .status(200)
        .json({ success: true, payload: "Employee Updated" });
    } catch (error) {
      next(error);
    }
  }
}

class JobRolesController {
  static createJobRole = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const role = req.body.role as string;
      if (!role) throw createCustomError("Please provide a role to add", 400);
      if (!Helpers.checkRole(role))
        throw createCustomError("invalid role", 400);
      const isCrated = await RoleModel.create({
        title: role,
        code: Helpers.convertRole(role),
      });

      if (!isCrated) throw createCustomError("Unable to create row", 500);

      return res
        .status(201)
        .json({ success: true, payload: "Job role created!" });
    } catch (error) {
      next(error);
    }
  };

  static deleteJobRole = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const roleId = req.params.roleId;
      const response = await RoleModel.findOne({ where: { role_id: roleId } });

      if (!response) throw createCustomError("No role found", 404);

      return res
        .status(200)
        .json({ success: true, payload: "Job role deleted" });
    } catch (error) {
      next(error);
    }
  };
  static getAvailableRoles = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const response = await RoleModel.findAll({ where: { user_id: null } });

      if (response.length === 0) throw createCustomError("No role found", 404);

      return res.status(200).json({
        success: true,
        payload: response,
        hits: response.length,
        message: "Available Roles retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  static updateEmployee = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const { status, employeeId } = req.body as {
        status: string;
        employeeId: string;
      };

      if (!status || !employeeId)
        throw createCustomError("Inputs cannot be empty", 400);
      if (!Helpers.isBoolean(status.toString()))
        throw createCustomError("invalid input 'status'", 400);
      const employee = await UserModel.findOne({
        where: { user_id: employeeId, user_type: EMPLOYEE_ROLE },
      });
      if (!employee)
        throw createCustomError(
          "Employee not found. please check your input and try again",
          404
        );

      const response = await RoleModel.update(
        { is_active: Boolean(status) },
        { where: { user_id: employeeId } }
      );

      if (!response) throw createCustomError("Unable to update Employee", 500);

      return res
        .status(200)
        .json({
          success: true,
          payload: "Employee state updated successfully",
        });
    } catch (error) {
      next(error);
    }
  };
  static assignRole = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const { userId, role } = req.body;

      if (!userId) throw createCustomError("input cannot be empty", 400);

      if (!Helpers.checkRole(role))
        throw createCustomError("invalid role", 400);
      const employee = await UserModel.findOne({
        where: { user_id: userId, user_type: EMPLOYEE_ROLE },
        include: RoleModel,
      });
      if (!employee)
        throw createCustomError(
          "Employee not found. please check your input and try again",
          404
        );

      if (employee.dataValues.Role)
        throw createCustomError("Employee is already assigned a job role", 400);

      const response = await RoleModel.update(
        { user_id: userId },
        { where: { user_id: null, code: Helpers.convertRole(role) } }
      );

      if (!response) throw createCustomError("Unable to update Employee", 500);

      return res
        .status(200)
        .json({ success: true, payload: "Role assigned successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export { EmployeeController, JobRolesController };
