import express from "express";
import RegisterController from "../controllers/registrationCtrl";
const router = express.Router();
router.post("/register", RegisterController.createAdmin);
export default router;
