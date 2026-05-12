const pool = require("../db/pool");

const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, l.name as location_name
      FROM receipts r
      LEFT JOIN locations l ON l.id = r.destination_location_id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const receipt = await pool.query(
      `SELECT r.*, l.name as location_name
       FROM receipts r
       LEFT JOIN locations l ON l.id = r.destination_location_id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (!receipt.rows[0]) return res.status(404).json({ error: "Not found" });

    const lines = await pool.query(
      `SELECT rl.*, p.name as product_name, p.sku
       FROM receipt_lines rl
       JOIN products p ON p.id = rl.product_id
       WHERE rl.receipt_id = $1`,
      [req.params.id]
    );
    res.json({ ...receipt.rows[0], lines: lines.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  const { supplier_name, destination_location_id, lines } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ref = "REC-" + Date.now();
    const receipt = await client.query(
      `INSERT INTO receipts (reference, supplier_name, destination_location_id, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ref, supplier_name, destination_location_id, req.user.id]
    );
    const receiptId = receipt.rows[0].id;

    for (const line of lines) {
      await client.query(
        `INSERT INTO receipt_lines (receipt_id, product_id, expected_qty)
         VALUES ($1, $2, $3)`,
        [receiptId, line.product_id, line.quantity]
      );
    }
    await client.query("COMMIT");
    res.status(201).json(receipt.rows[0]);
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
    const receipt = await client.query(
      "SELECT * FROM receipts WHERE id = $1", [req.params.id]
    );
    if (!receipt.rows[0]) return res.status(404).json({ error: "Not found" });
    if (receipt.rows[0].status === "done")
      return res.status(400).json({ error: "Already validated" });

    const lines = await client.query(
      "SELECT * FROM receipt_lines WHERE receipt_id = $1", [req.params.id]
    );

    for (const line of lines.rows) {
      // Update received_qty
      await client.query(
        "UPDATE receipt_lines SET received_qty = expected_qty WHERE id = $1",
        [line.id]
      );
      // Upsert stock level
      await client.query(
        `INSERT INTO stock_levels (product_id, location_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, location_id)
         DO UPDATE SET quantity = stock_levels.quantity + $3, updated_at = NOW()`,
        [line.product_id, receipt.rows[0].destination_location_id, line.expected_qty]
      );
      // Log stock move
      await client.query(
        `INSERT INTO stock_moves (product_id, to_location_id, quantity, move_type, reference_id, reference_type, created_by)
         VALUES ($1, $2, $3, 'receipt', $4, 'receipt', $5)`,
        [line.product_id, receipt.rows[0].destination_location_id, line.expected_qty, receipt.rows[0].id, req.user.id]
      );
    }

    await client.query(
      "UPDATE receipts SET status = 'done', validated_at = NOW() WHERE id = $1",
      [req.params.id]
    );
    await client.query("COMMIT");
    res.json({ message: "Receipt validated, stock updated" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { getAll, getOne, create, validate };