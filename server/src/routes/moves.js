const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const pool = require("../db/pool");

router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sm.id,
        sm.move_type,
        sm.quantity,
        sm.created_at,
        p.name  as product_name,
        p.sku   as product_sku,
        fl.name as from_location,
        tl.name as to_location,
        u.name  as created_by
      FROM stock_moves sm
      LEFT JOIN products  p  ON p.id  = sm.product_id
      LEFT JOIN locations fl ON fl.id = sm.from_location_id
      LEFT JOIN locations tl ON tl.id = sm.to_location_id
      LEFT JOIN users     u  ON u.id  = sm.created_by
      ORDER BY sm.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;