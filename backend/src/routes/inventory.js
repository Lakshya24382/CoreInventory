import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  dashboardKpis,
  skuExplorer,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Simple SKU inventory explorer
router.get("/sku-explorer", requireAuth, skuExplorer);

// Basic dashboard KPIs
router.get("/dashboard-kpis", requireAuth, dashboardKpis);

export default router;

