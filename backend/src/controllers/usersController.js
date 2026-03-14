import { query } from "../db.js";

export async function createStaffLoginIds(req, res) {
  const { count = 1 } = req.body;
  const toCreate = Math.max(1, Math.min(Number(count) || 1, 50));

  try {
    const result = [];
    for (let i = 0; i < toCreate; i += 1) {
      const seqRes = await query(
        "INSERT INTO staff_login_sequences DEFAULT VALUES RETURNING id"
      );
      const seq = seqRes.rows[0].id;
      const loginId = `STF-${String(seq).padStart(4, "0")}`;
      const userRes = await query(
        "INSERT INTO users (login_id, role, is_active) VALUES ($1, 'staff', false) RETURNING id, login_id",
        [loginId]
      );
      result.push(userRes.rows[0]);
    }
    return res.json({ loginIds: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMe(req, res) {
  try {
    const me = await query(
      "SELECT id, login_id, email, phone, role FROM users WHERE id = $1",
      [req.user.userId]
    );
    return res.json(me.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateMe(req, res) {
  const { email, phone } = req.body;
  try {
    const updated = await query(
      "UPDATE users SET email = $1, phone = $2 WHERE id = $3 RETURNING id, login_id, email, phone, role",
      [email, phone, req.user.userId]
    );
    return res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

