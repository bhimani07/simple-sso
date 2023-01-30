import express from "express";
import * as authService from "../domain/auth/auth";

const router = express.Router();

router.route("/login").get(authService.login).post(authService.dologin);
router.route("/verifyToken").get(authService.verifyToken);

export default router;
