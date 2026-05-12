const pool = require("../db/pool");

const getKPIs = async (req, res) => {
  try {
    const [products, lowStock, pendingReceipts, pendingDeliveries, pendingTransfers] =
      await Promise.all([
        pool.query("SELECT COUNT(*) FROM products"),
        pool.query(`
          SELECT COUNT(DISTINCT p.id) FROM products p
          LEFT JOIN stock_levels sl ON sl.product_id = p.id
          GROUP BY p.id
          HAVING COALESCE(SUM(sl.quantity), 0) <= p.reorder_level
        `),
        pool.query("SELECT COUNT(*) FROM receipts WHERE status IN ('draft','waiting','ready')"),
        pool.query("SELECT COUNT(*) FROM deliveries WHERE status IN ('draft','waiting','ready')"),
        pool.query("SELECT COUNT(*) FROM transfers WHERE status IN ('draft','waiting','ready')"),
      ]);

    res.json({
      total_products: parseInt(products.rows[0].count),
      low_stock_items: parseInt(lowStock.rows[0]?.count || 0),
      pending_receipts: parseInt(pendingReceipts.rows[0].count),
      pending_deliveries: parseInt(pendingDeliveries.rows[0].count),
      pending_transfers: parseInt(pendingTransfers.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getKPIs };