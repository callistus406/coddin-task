import dotenv from "dotenv";
dotenv.config();
// environment variable setup

export const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET as string;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const CONFIRMATION_TOKEN_SECRET = process.env
  .CONFIRMATION_TOKEN_SECRET as string;

export const ADMIN_ROLE = process.env.ADMIN_ROLE as string;
export const USER_ROLE = process.env.USER_ROLE as string;
export const MANAGER_ROLE = process.env.MANAGER_ROLE as string;
export const DEVELOPER_ROLE = process.env.DEVELOPER_ROLE as string;
export const DESIGN_ROLE = process.env.DESIGN_ROLE as string;
export const SCRUM_MASTER_ROLE = process.env.SCRUM_MASTER_ROLE as string;
export const EMPLOYEE_ROLE = process.env.EMPLOYEE_ROLE as string;
