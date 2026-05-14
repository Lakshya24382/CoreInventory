const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const pool = require("../db/pool");
const bcrypt = require("bcrypt");

// Middleware — managers only
const managerOnly = (req, res, next) => {
  if (req.user.role !== "manager")
    return res.status(403).json({ error: "Access denied. Managers only." });
  next();
};

// Generate employee ID like EMP-001
const generateEmployeeId = async () => {
  const result = await pool.query(
    "SELECT employee_id FROM users WHERE employee_id IS NOT NULL ORDER BY employee_id DESC LIMIT 1"
  );
  if (!result.rows[0]) return "EMP-001";
  const last = parseInt(result.rows[0].employee_id.split("-")[1]);
  return `EMP-${String(last + 1).padStart(3, "0")}`;
};

// Generate random temp password
const generateTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

// GET all employees
router.get("/", auth, managerOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, employee_id, role, is_temp_password, created_at
       FROM users WHERE role = 'staff' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE employee — manager generates ID + temp password
router.post("/", auth, managerOnly, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const employee_id   = await generateEmployeeId();
    const tempPassword  = generateTempPassword();
    const password_hash = await bcrypt.hash(tempPassword, 10);

    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role, employee_id, is_temp_password)
       VALUES ('Pending', $1, $2, 'staff', $3, TRUE)
       RETURNING id, employee_id, role`,
      [`${employee_id}@pending`, password_hash, employee_id]
    );

    await client.query("COMMIT");

    // Return the temp credentials to show the manager
    res.status(201).json({
      employee_id,
      temp_password: tempPassword,
      message: "Share these credentials with the employee to complete registration",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE employee
router.delete("/:id", auth, managerOnly, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const id = req.params.id;

    // Nullify all references to this user before deleting
    await client.query("UPDATE receipts     SET created_by = NULL WHERE created_by = $1", [id]);
    await client.query("UPDATE deliveries   SET created_by = NULL WHERE created_by = $1", [id]);
    await client.query("UPDATE transfers    SET created_by = NULL WHERE created_by = $1", [id]);
    await client.query("UPDATE adjustments  SET created_by = NULL WHERE created_by = $1", [id]);
    await client.query("UPDATE stock_moves  SET created_by = NULL WHERE created_by = $1", [id]);

    await client.query(
      "DELETE FROM users WHERE id = $1 AND role = 'staff'", [id]
    );

    await client.query("COMMIT");
    res.json({ message: "Employee removed" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;