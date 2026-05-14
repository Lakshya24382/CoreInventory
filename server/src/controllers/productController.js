const pool = require("../db/pool");

const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name,
        COALESCE(SUM(sl.quantity), 0) as total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock_levels sl ON sl.product_id = p.id
      GROUP BY p.id, c.name
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  const { name, sku, category_id, unit_of_measure, reorder_level } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (name, sku, category_id, unit_of_measure, reorder_level)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, sku, category_id, unit_of_measure || "units", reorder_level || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  const { name, sku, category_id, unit_of_measure, reorder_level } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET name=$1, sku=$2, category_id=$3,
       unit_of_measure=$4, reorder_level=$5
       WHERE id=$6 RETURNING *`,
      [name, sku, category_id, unit_of_measure, reorder_level, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const id = req.params.id;

    // Remove all related records first
    await client.query("DELETE FROM stock_levels    WHERE product_id = $1", [id]);
    await client.query("DELETE FROM receipt_lines   WHERE product_id = $1", [id]);
    await client.query("DELETE FROM delivery_lines  WHERE product_id = $1", [id]);
    await client.query("DELETE FROM transfer_lines  WHERE product_id = $1", [id]);
    await client.query("DELETE FROM adjustment_lines WHERE product_id = $1", [id]);
    await client.query("DELETE FROM stock_moves     WHERE product_id = $1", [id]);

    await client.query("DELETE FROM products WHERE id = $1", [id]);

    await client.query("COMMIT");
    res.json({ message: "Product deleted" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const getCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove, getCategories };