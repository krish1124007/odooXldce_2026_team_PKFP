import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user/user.auth.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

export default router;
