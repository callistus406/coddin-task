import express from "express";
import AuthController from "../controllers/authenticationCtrl";
const router = express.Router();
router.post("/sign-in", AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/sign-out", AuthController.logOut);
export default router;
