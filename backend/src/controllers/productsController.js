import { query } from "../db.js";

export async function listProducts(req, res) {
  try {
    const result = await query(
      "SELECT id, name, sku, category, uom, reorder_level FROM products ORDER BY name"
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createProduct(req, res) {
  const { name, sku, category, uom, reorderLevel } = req.body;
  try {
    const result = await query(
      "INSERT INTO products (name, sku, category, uom, reorder_level) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, sku, category, uom, reorderLevel ?? 0]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, category, uom, reorderLevel } = req.body;
  try {
    const result = await query(
      "UPDATE products SET name = $1, category = $2, uom = $3, reorder_level = $4 WHERE id = $5 RETURNING *",
      [name, category, uom, reorderLevel ?? 0, id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    await query("DELETE FROM products WHERE id = $1", [id]);
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

