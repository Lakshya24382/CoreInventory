import express from "express";
import { requireAuth, requireManager } from "../middlewares/auth.js";
import {
  createWarehouse,
  listWarehouses,
  updateWarehouse,
} from "../controllers/warehousesController.js";

const router = express.Router();

// List warehouses
router.get("/", requireAuth, listWarehouses);

// Create warehouse (manager only)
router.post("/", requireAuth, requireManager, createWarehouse);

// Update warehouse (manager only)
router.put("/:id", requireAuth, requireManager, updateWarehouse);

export default router;

