import express from "express";
import { verifyJWT } from "../../../middlewares/verifyJwt";
import VerifyUser from "../../../middlewares/verify";
import {
  EmployeeController,
  JobRolesController,
} from "../controllers/managementCtrl";
const router = express.Router();
router.post(
  "/create-employee",
  verifyJWT,
  VerifyUser.isAdmin,
  EmployeeController.createEmployee
);
router.get(
  "/get-employee/filter",
  verifyJWT,
  VerifyUser.isAdmin,
  EmployeeController.getEmployee
);
router.get(
  "/get-employees",
  verifyJWT,
  VerifyUser.isAdmin,
  EmployeeController.getEmployees
);
router.delete(
  "/delete-employee/:employeeId",
  verifyJWT,
  VerifyUser.isAdmin,
  EmployeeController.deleteEmployee
);
router.get(
  "/get-roles",
  verifyJWT,
  VerifyUser.isAdmin,
  JobRolesController.getAvailableRoles
);
router.patch(
  "/assign-role",
  verifyJWT,
  VerifyUser.isAdmin,
  JobRolesController.assignRole
);
router.post(
  "/create-role",
  verifyJWT,
  VerifyUser.isAdmin,
  JobRolesController.createJobRole
);
router.patch(
  "/update-employee",
  verifyJWT,
  VerifyUser.isAdmin,
  JobRolesController.updateEmployee
);

export default router;
