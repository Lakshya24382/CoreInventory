import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import {
  sendPasswordResetOtpEmail,
  sendSignupConfirmationEmail,
} from "../services/email.js";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export async function signup(req, res) {
  const { loginId, email, password } = req.body;
  if (!loginId || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }
  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({ message: "Password does not meet complexity requirements" });
  }

  try {
    const existing = await query(
      "SELECT id, email, is_active FROM users WHERE login_id = $1",
      [loginId]
    );
    if (existing.rowCount === 0) {
      return res.status(400).json({ message: "Invalid login ID" });
    }
    const user = existing.rows[0];
    if (user.is_active) {
      return res.status(400).json({ message: "Account already activated" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      "UPDATE users SET email = $1, password_hash = $2, is_active = true WHERE id = $3",
      [email, passwordHash, user.id]
    );

    await sendSignupConfirmationEmail(email, loginId);
    return res.json({ message: "Account activated. You can now login." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  const { loginId, password } = req.body;
  if (!loginId || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const result = await query(
      "SELECT id, login_id, email, role, password_hash, is_active FROM users WHERE login_id = $1",
      [loginId]
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ message: "Account not activated" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, loginId: user.login_id, role: user.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        loginId: user.login_id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function requestPasswordResetOtp(req, res) {
  const { loginId } = req.body;
  if (!loginId) {
    return res.status(400).json({ message: "Login ID required" });
  }

  try {
    const result = await query("SELECT id, email FROM users WHERE login_id = $1", [
      loginId,
    ]);
    if (result.rowCount === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(
      Date.now() + Number(process.env.OTP_TTL_MINUTES || 15) * 60 * 1000
    );

    await query(
      "INSERT INTO password_reset_otps (user_id, otp, expires_at) VALUES ($1, $2, $3)",
      [user.id, otp, expiresAt]
    );
    await sendPasswordResetOtpEmail(user.email, otp);
    return res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function resetPassword(req, res) {
  const { loginId, otp, newPassword } = req.body;
  if (!loginId || !otp || !newPassword) {
    return res.status(400).json({ message: "Missing fields" });
  }
  if (!passwordRegex.test(newPassword)) {
    return res
      .status(400)
      .json({ message: "Password does not meet complexity requirements" });
  }

  try {
    const userResult = await query("SELECT id FROM users WHERE login_id = $1", [
      loginId,
    ]);
    if (userResult.rowCount === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    const otpResult = await query(
      "SELECT id, expires_at, used FROM password_reset_otps WHERE user_id = $1 AND otp = $2 ORDER BY created_at DESC LIMIT 1",
      [user.id, otp]
    );
    if (otpResult.rowCount === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const record = otpResult.rows[0];
    if (record.used || new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ message: "OTP expired or used" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hash,
      user.id,
    ]);
    await query("UPDATE password_reset_otps SET used = true WHERE id = $1", [
      record.id,
    ]);
    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

