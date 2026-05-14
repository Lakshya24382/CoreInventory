const pool = require("../db/pool");

const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*,
        fl.name as from_location_name,
        tl.name as to_location_name
      FROM transfers t
      LEFT JOIN locations fl ON fl.id = t.from_location_id
      LEFT JOIN locations tl ON tl.id = t.to_location_id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  const { from_location_id, to_location_id, lines } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ref = "TRF-" + Date.now();
    const transfer = await client.query(
      `INSERT INTO transfers (reference, from_location_id, to_location_id, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ref, from_location_id, to_location_id, req.user.id]
    );
    for (const line of lines) {
      await client.query(
        `INSERT INTO transfer_lines (transfer_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [transfer.rows[0].id, line.product_id, line.quantity]
      );
    }
    await client.query("COMMIT");
    res.status(201).json(transfer.rows[0]);
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
    const transfer = await client.query(
      "SELECT * FROM transfers WHERE id = $1", [req.params.id]
    );
    if (!transfer.rows[0]) return res.status(404).json({ error: "Not found" });
    if (transfer.rows[0].status === "done")
      return res.status(400).json({ error: "Already validated" });

    const lines = await client.query(
      "SELECT * FROM transfer_lines WHERE transfer_id = $1", [req.params.id]
    );
    const { from_location_id, to_location_id } = transfer.rows[0];

    for (const line of lines.rows) {
      const stock = await client.query(
        `SELECT quantity FROM stock_levels WHERE product_id = $1 AND location_id = $2`,
        [line.product_id, from_location_id]
      );
      if (parseFloat(stock.rows[0]?.quantity || 0) < line.quantity)
        throw new Error(`Insufficient stock for product ID ${line.product_id}`);

      // Deduct from source
      await client.query(
        `UPDATE stock_levels SET quantity = quantity - $1, updated_at = NOW()
         WHERE product_id = $2 AND location_id = $3`,
        [line.quantity, line.product_id, from_location_id]
      );
      // Add to destination
      await client.query(
        `INSERT INTO stock_levels (product_id, location_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, location_id)
         DO UPDATE SET quantity = stock_levels.quantity + $3, updated_at = NOW()`,
        [line.product_id, to_location_id, line.quantity]
      );
      // Log move
      await client.query(
        `INSERT INTO stock_moves (product_id, from_location_id, to_location_id, quantity, move_type, reference_id, reference_type, created_by)
         VALUES ($1, $2, $3, $4, 'transfer', $5, 'transfer', $6)`,
        [line.product_id, from_location_id, to_location_id, line.quantity, transfer.rows[0].id, req.user.id]
      );
    }

    await client.query(
      "UPDATE transfers SET status = 'done', validated_at = NOW() WHERE id = $1",
      [req.params.id]
    );
    await client.query("COMMIT");
    res.json({ message: "Transfer validated, stock moved" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const remove = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM transfer_lines WHERE transfer_id = $1", [req.params.id]);
    await client.query("DELETE FROM transfers WHERE id = $1", [req.params.id]);
    await client.query("COMMIT");
    res.json({ message: "Transfer deleted" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { getAll, create, validate, remove };