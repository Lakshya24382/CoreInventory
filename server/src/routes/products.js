const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const managerOnly = require("../middleware/managerOnly");
const {
  getAll, getOne, create, update,
  remove, getCategories, getArchived, restore
} = require("../controllers/productController");
const pool = require("../db/pool");

router.get("/categories", auth, getCategories);
router.get("/archived",   auth, managerOnly, getArchived);
router.get("/",           auth, getAll);
router.get("/:id",        auth, getOne);
router.post("/",          auth, managerOnly, create);
router.put("/:id",        auth, managerOnly, update);
router.delete("/:id",     auth, managerOnly, remove);
router.put("/:id/restore", auth, managerOnly, restore);
router.get("/:id/stock/:locationId", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(quantity, 0) as quantity
       FROM stock_levels
       WHERE product_id = $1 AND location_id = $2`,
      [req.params.id, req.params.locationId]
    );
    res.json({ quantity: result.rows[0]?.quantity || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;