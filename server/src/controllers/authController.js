const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1", [email]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, name, email, role`,
      [name, email, password_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1", [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET CURRENT USER
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getMe };

const { sendOTPEmail } = require("../utils/sendEmail");

// FORGOT PASSWORD — send OTP
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1", [email]
    );
    if (!result.rows[0])
      return res.status(404).json({ error: "No account with that email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "UPDATE users SET otp = $1, otp_expires_at = $2 WHERE email = $3",
      [otp, expires, email]
    );

    // Add timeout so it doesn't hang forever
    const emailPromise = sendOTPEmail(email, otp);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email timeout")), 10000)
    );

    await Promise.race([emailPromise, timeoutPromise]);
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).json({ error: "Failed to send email. Check your EMAIL_USER and EMAIL_PASS on Render." });
  }
};

// VERIFY OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await pool.query(
      "SELECT otp, otp_expires_at FROM users WHERE email = $1", [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > new Date(user.otp_expires_at))
      return res.status(400).json({ error: "OTP has expired" });

    res.json({ message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const result = await pool.query(
      "SELECT otp, otp_expires_at FROM users WHERE email = $1", [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > new Date(user.otp_expires_at))
      return res.status(400).json({ error: "OTP has expired" });

    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1, otp = NULL, otp_expires_at = NULL WHERE email = $2",
      [password_hash, email]
    );
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getMe, forgotPassword, verifyOTP, resetPassword };

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role",
      [name, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1", [req.user.id]
    );
    const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!match) return res.status(400).json({ error: "Current password is incorrect" });

    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [password_hash, req.user.id]
    );
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register, login, getMe,
  forgotPassword, verifyOTP, resetPassword,
  updateProfile, changePassword
};