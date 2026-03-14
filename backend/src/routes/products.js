import express from "express";
import { requireAuth, requireManager } from "../middlewares/auth.js";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "../controllers/productsController.js";

const router = express.Router();

// List products
router.get("/", requireAuth, listProducts);

// Create product (manager only)
router.post("/", requireAuth, requireManager, createProduct);

// Update product (manager only)
router.put("/:id", requireAuth, requireManager, updateProduct);

// Delete product (manager only)
router.delete("/:id", requireAuth, requireManager, deleteProduct);

export default router;

