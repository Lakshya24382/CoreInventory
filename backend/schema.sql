-- PostgreSQL schema for Inventory Management System

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  login_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  password_hash TEXT,
  role VARCHAR(20) NOT NULL CHECK (role IN ('manager', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper sequence table for generating staff login IDs
CREATE TABLE IF NOT EXISTS staff_login_sequences (
  id SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  UNIQUE (warehouse_id, code)
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100),
  uom VARCHAR(50) NOT NULL,
  reorder_level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity NUMERIC(14, 3) NOT NULL DEFAULT 0,
  UNIQUE (product_id, location_id)
);

CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  supplier VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'validated')),
  created_by INTEGER REFERENCES users(id),
  validated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id SERIAL PRIMARY KEY,
  receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  location_id INTEGER NOT NULL REFERENCES locations(id),
  quantity NUMERIC(14, 3) NOT NULL
);

CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  delivery_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'picking', 'packed', 'approved')),
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS delivery_items (
  id SERIAL PRIMARY KEY,
  delivery_id INTEGER NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  from_location_id INTEGER NOT NULL REFERENCES locations(id),
  quantity NUMERIC(14, 3) NOT NULL
);

CREATE TABLE IF NOT EXISTS transfers (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  from_location_id INTEGER NOT NULL REFERENCES locations(id),
  to_location_id INTEGER NOT NULL REFERENCES locations(id),
  quantity NUMERIC(14, 3) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adjustments (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  location_id INTEGER NOT NULL REFERENCES locations(id),
  system_quantity NUMERIC(14, 3) NOT NULL,
  counted_quantity NUMERIC(14, 3) NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS move_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  from_location_id INTEGER REFERENCES locations(id),
  to_location_id INTEGER REFERENCES locations(id),
  quantity NUMERIC(14, 3) NOT NULL,
  action VARCHAR(50) NOT NULL,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dashboard helper views
CREATE OR REPLACE VIEW v_low_stock AS
SELECT
  p.id,
  p.name,
  p.sku,
  p.reorder_level,
  COALESCE(SUM(i.quantity), 0) AS total_quantity
FROM products p
LEFT JOIN inventory i ON i.product_id = p.id
GROUP BY p.id
HAVING COALESCE(SUM(i.quantity), 0) <= p.reorder_level;

