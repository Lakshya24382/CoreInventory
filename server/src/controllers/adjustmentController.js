const pool = require("../db/pool");

const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, l.name as location_name
      FROM adjustments a
      LEFT JOIN locations l ON l.id = a.location_id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  const { location_id, reason, lines } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ref = "ADJ-" + Date.now();
    const adj = await client.query(
      `INSERT INTO adjustments (reference, location_id, reason, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ref, location_id, reason, req.user.id]
    );
    for (const line of lines) {
      await client.query(
        `INSERT INTO adjustment_lines (adjustment_id, product_id, recorded_qty, actual_qty)
         VALUES ($1, $2, $3, $4)`,
        [adj.rows[0].id, line.product_id, line.recorded_qty, line.actual_qty]
      );
    }
    await client.query("COMMIT");
    res.status(201).json(adj.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const validate = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const adj = await client.query(
      "SELECT * FROM adjustments WHERE id = $1", [req.params.id]
    );
    if (!adj.rows[0]) return res.status(404).json({ error: "Not found" });
    if (adj.rows[0].status === "done")
      return res.status(400).json({ error: "Already validated" });

    const lines = await client.query(
      "SELECT * FROM adjustment_lines WHERE adjustment_id = $1", [req.params.id]
    );

    for (const line of lines.rows) {
      await client.query(
        `INSERT INTO stock_levels (product_id, location_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, location_id)
         DO UPDATE SET quantity = $3, updated_at = NOW()`,
        [line.product_id, adj.rows[0].location_id, line.actual_qty]
      );
      await client.query(
        `INSERT INTO stock_moves (product_id, quantity, move_type, reference_id, reference_type, created_by, to_location_id)
         VALUES ($1, $2, 'adjustment', $3, 'adjustment', $4, $5)`,
        [line.product_id, line.difference, adj.rows[0].id, req.user.id, adj.rows[0].location_id]
      );
    }

    await client.query(
      "UPDATE adjustments SET status = 'done', validated_at = NOW() WHERE id = $1",
      [req.params.id]
    );
    await client.query("COMMIT");
    res.json({ message: "Adjustment validated, stock corrected" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { getAll, create, validate };