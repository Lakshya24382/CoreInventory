import { query } from "../db.js";

export async function skuExplorer(req, res) {
  const { search, warehouseId } = req.query;
  const params = [];
  const conditions = [];

  if (search) {
    params.push(`%${search}%`);
    params.push(`%${search}%`);
    conditions.push(
      `(p.sku ILIKE $${params.length - 1} OR p.name ILIKE $${params.length})`
    );
  }

  if (warehouseId) {
    params.push(warehouseId);
    conditions.push(`w.id = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await query(
      `
      SELECT
        p.id as product_id,
        p.name as product_name,
        p.sku,
        w.name as warehouse_name,
        l.name as location_name,
        COALESCE(i.quantity, 0) as quantity
      FROM products p
      JOIN inventory i ON i.product_id = p.id
      JOIN locations l ON l.id = i.location_id
      JOIN warehouses w ON w.id = l.warehouse_id
      ${where}
      ORDER BY p.sku, w.name, l.name
      `,
      params
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function dashboardKpis(req, res) {
  try {
    const [
      { rows: products },
      { rows: lowStock },
      { rows: receipts },
      { rows: deliveries },
      { rows: transfers },
    ] = await Promise.all([
      query("SELECT COUNT(*) FROM products"),
      query("SELECT COUNT(*) FROM v_low_stock"),
      query("SELECT COUNT(*) FROM receipts WHERE status = 'draft'"),
      query("SELECT COUNT(*) FROM deliveries WHERE status != 'approved'"),
      query("SELECT COUNT(*) FROM transfers"),
    ]);

    return res.json({
      totalProducts: Number(products[0].count),
      lowStockItems: Number(lowStock[0].count),
      pendingReceipts: Number(receipts[0].count),
      pendingDeliveries: Number(deliveries[0].count),
      internalTransfers: Number(transfers[0].count),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

