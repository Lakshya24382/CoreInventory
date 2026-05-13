const express = require("express");
const router = express.Router();
const {
  register, login, getMe,
  forgotPassword, verifyOTP, resetPassword,
  updateProfile, changePassword
} = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register",         register);
router.post("/login",            login);
router.get("/me",                auth, getMe);
router.post("/forgot-password",  forgotPassword);
router.post("/verify-otp",       verifyOTP);
router.post("/reset-password",   resetPassword);
router.put("/profile",           auth, updateProfile);
router.put("/change-password",   auth, changePassword);

module.exports = router;