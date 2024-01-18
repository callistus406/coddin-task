import dotenv from "dotenv";
import { NextFunction, Response } from "express";
dotenv.config();
import { ADMIN_ROLE } from "../shared/constants";

class VerifyUser {
  static ensureAuthenticated(req: any, res: Response, next: NextFunction) {
    const user = req.user;

    if (user?.role === ADMIN_ROLE) {
      return next();
    }

    return res.status(304);
  }
  static forwardAuthenticated(req: any, res: Response, next: NextFunction) {
    const user = req.user;
    if (user?.role === ADMIN_ROLE || user.role === ADMIN_ROLE) {
      return res.status(301).json({
        success: true,
        payload: { redirectRoute: "/admin/dashboard" },
      });
    } else if (user?.role === ADMIN_ROLE) {
      return res
        .status(301)
        .json({ success: true, payload: { redirectRoute: "/" } });
    }
    return next();
  }
  static isAdmin(req: any, res: Response, next: NextFunction) {
    const user = req.user;

    if (user.role === ADMIN_ROLE) return next();
    return res.status(400).json({
      success: false,
      payload: {
        message: "You are not authorized to access this resource",
        redirectUrl: "/",
      },
    });
  }
}
export default VerifyUser;
