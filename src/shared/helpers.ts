import { createCustomError } from "../middlewares/customError";
import { UserModel } from "../model";
import { RegistrationValidator } from "../validation";
import { HashPassword } from "./bcrypt";
import {
  ADMIN_ROLE,
  DESIGN_ROLE,
  DEVELOPER_ROLE,
  MANAGER_ROLE,
  SCRUM_MASTER_ROLE,
} from "./constants";

class Helpers {
  static checkRole(role: string) {
    const result = ["manager", "developer", "design", "scrum master"];
    if (!result.includes(role.toLocaleLowerCase())) return false;

    return true;
  }
  static convertRole(role: string): string {
    if (role === "manager") return MANAGER_ROLE;
    if (role === "developer") return DEVELOPER_ROLE;
    if (role === "design") return DESIGN_ROLE;
    return SCRUM_MASTER_ROLE;
  }
  static async createAdmin({
    firstName,
    lastName,
    email,
    password,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    try {
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
      if (user) return {};
      const hashedPassword = await new HashPassword(password).hash();

      // const newUser = await createUser(regData);

      const newUser = await UserModel.create({
        first_name: firstName,
        last_name: lastName,
        hashed_password: hashedPassword,
        email: email,
        is_verified: true,
        is_active: true,
        user_type: ADMIN_ROLE,
      });

      if (!newUser)
        throw createCustomError(
          "Sorry Something went wrong, Please try again",
          500
        );
      return newUser;
    } catch (error: any) {
      throw createCustomError(error, 500);
    }
  }

  static employeeStatusConverter(status: string): boolean {
    if (status.toLocaleLowerCase() === "employed") return true;
    return false;
  }
}

export default Helpers;
