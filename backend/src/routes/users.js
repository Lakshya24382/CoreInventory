import express from "express";
import { requireAuth, requireManager } from "../middlewares/auth.js";
import {
  createStaffLoginIds,
  getMe,
  updateMe,
} from "../controllers/usersController.js";

const router = express.Router();

// Manager generates staff login IDs
router.post("/staff-login-ids", requireAuth, requireManager, createStaffLoginIds);

// Basic profile fetch
router.get("/me", requireAuth, getMe);

// Update profile
router.put("/me", requireAuth, updateMe);

export default router;

