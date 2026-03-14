import pkg from "pg";

const { Pool } = pkg;

const parseBool = (v) => String(v || "").toLowerCase() === "true";

const sslEnabled = parseBool(process.env.DB_SSL);
const ssl =
  sslEnabled === true
    ? {
        rejectUnauthorized: parseBool(process.env.DB_SSL_REJECT_UNAUTHORIZED),
      }
    : undefined;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl,
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "coreinventory",
      ssl,
    });

export const query = (text, params) => pool.query(text, params);

