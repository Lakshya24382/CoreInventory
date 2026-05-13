const pool = require("../src/db/pool");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function createManager() {
  const name     = "Lakshya Modi";       // change to your name
  const email    = "lakshya@coreinventory.com"; // manager email
  const password = "Manager@123";        // manager password

  const password_hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'manager')
     ON CONFLICT (email) DO NOTHING
     RETURNING id, name, email, role`,
    [name, email, password_hash]
  );

  if (result.rows[0]) {
    console.log("✅ Manager created:", result.rows[0]);
  } else {
    console.log("⚠️  Email already exists");
  }

  await pool.end();
}

createManager().catch(console.error);