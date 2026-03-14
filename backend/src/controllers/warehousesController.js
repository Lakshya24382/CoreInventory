import { query } from "../db.js";

export async function listWarehouses(req, res) {
  try {
    const result = await query(
      "SELECT id, name, code, address, is_active FROM warehouses ORDER BY name"
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createWarehouse(req, res) {
  const { name, code, address } = req.body;
  try {
    const result = await query(
      "INSERT INTO warehouses (name, code, address) VALUES ($1, $2, $3) RETURNING *",
      [name, code, address]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateWarehouse(req, res) {
  const { id } = req.params;
  const { name, address, isActive } = req.body;
  try {
    const result = await query(
      "UPDATE warehouses SET name = $1, address = $2, is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING *",
      [name, address, isActive, id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

