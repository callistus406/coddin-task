import express from "express";
import authentication from "./routes/authentication";
import employee from "./routes/management";
const router = express.Router();
router.use(authentication);
router.use(employee);

export default router;
