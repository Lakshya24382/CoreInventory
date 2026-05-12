const pool = require("../db/pool");

const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, l.name as location_name
      FROM deliveries d
      LEFT JOIN locations l ON l.id = d.source_location_id
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const delivery = await pool.query(
      `SELECT d.*, l.name as location_name
       FROM deliveries d
       LEFT JOIN locations l ON l.id = d.source_location_id
       WHERE d.id = $1`,
      [req.params.id]
    );
    if (!delivery.rows[0]) return res.status(404).json({ error: "Not found" });

    const lines = await pool.query(
      `SELECT dl.*, p.name as product_name, p.sku
       FROM delivery_lines dl
       JOIN products p ON p.id = dl.product_id
       WHERE dl.delivery_id = $1`,
      [req.params.id]
    );
    res.json({ ...delivery.rows[0], lines: lines.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  const { customer_name, source_location_id, lines } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ref = "DEL-" + Date.now();
    const delivery = await client.query(
      `INSERT INTO deliveries (reference, customer_name, source_location_id, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ref, customer_name, source_location_id, req.user.id]
    );
    const deliveryId = delivery.rows[0].id;

    for (const line of lines) {
      await client.query(
        `INSERT INTO delivery_lines (delivery_id, product_id, requested_qty)
         VALUES ($1, $2, $3)`,
        [deliveryId, line.product_id, line.quantity]
      );
    }
    await client.query("COMMIT");
    res.status(201).json(delivery.rows[0]);
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
    const delivery = await client.query(
      "SELECT * FROM deliveries WHERE id = $1", [req.params.id]
    );
    if (!delivery.rows[0]) return res.status(404).json({ error: "Not found" });
    if (delivery.rows[0].status === "done")
      return res.status(400).json({ error: "Already validated" });

    const lines = await client.query(
      "SELECT * FROM delivery_lines WHERE delivery_id = $1", [req.params.id]
    );

    for (const line of lines.rows) {
      // Check sufficient stock
      const stock = await client.query(
        `SELECT quantity FROM stock_levels
         WHERE product_id = $1 AND location_id = $2`,
        [line.product_id, delivery.rows[0].source_location_id]
      );
      const available = parseFloat(stock.rows[0]?.quantity || 0);
      if (available < line.requested_qty)
        throw new Error(`Insufficient stock for product ID ${line.product_id}`);

      await client.query(
        `UPDATE delivery_lines SET delivered_qty = requested_qty WHERE id = $1`,
        [line.id]
      );
      await client.query(
        `UPDATE stock_levels SET quantity = quantity - $1, updated_at = NOW()
         WHERE product_id = $2 AND location_id = $3`,
        [line.requested_qty, line.product_id, delivery.rows[0].source_location_id]
      );
      await client.query(
        `INSERT INTO stock_moves (product_id, from_location_id, quantity, move_type, reference_id, reference_type, created_by)
         VALUES ($1, $2, $3, 'delivery', $4, 'delivery', $5)`,
        [line.product_id, delivery.rows[0].source_location_id, line.requested_qty, delivery.rows[0].id, req.user.id]
      );
    }

    await client.query(
      "UPDATE deliveries SET status = 'done', validated_at = NOW() WHERE id = $1",
      [req.params.id]
    );
    await client.query("COMMIT");
    res.json({ message: "Delivery validated, stock reduced" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

module.exports = { getAll, getOne, create, validate };