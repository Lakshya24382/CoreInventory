import express from "express";
import {
  login,
  requestPasswordResetOtp,
  resetPassword,
  signup,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/password/otp", requestPasswordResetOtp);

router.post("/password/reset", resetPassword);

export default router;

