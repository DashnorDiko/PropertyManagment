CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  due_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('EUR', 'ALL')),
  paid_at DATE
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  unit_name TEXT NOT NULL,
  location_subtitle TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('vacant', 'occupied', 'sold')),
  tenant_name TEXT,
  rent_amount NUMERIC(12, 2) NOT NULL CHECK (rent_amount >= 0),
  rent_currency TEXT NOT NULL CHECK (rent_currency IN ('EUR', 'ALL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_spots (
  id TEXT PRIMARY KEY,
  spot_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('free', 'occupied')),
  assignee_type TEXT NOT NULL CHECK (assignee_type IN ('tenant', 'independent')),
  assignee_name TEXT,
  parking_card_number TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internet_services (
  id TEXT PRIMARY KEY,
  service_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('free', 'occupied')),
  assignee_type TEXT NOT NULL CHECK (assignee_type IN ('tenant', 'independent')),
  assignee_name TEXT,
  modem_serial_number TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manager_settings (
  id TEXT PRIMARY KEY,
  administration_fee NUMERIC(12, 2) NOT NULL CHECK (administration_fee >= 0),
  administration_currency TEXT NOT NULL CHECK (administration_currency IN ('EUR', 'ALL'))
);

INSERT INTO manager_settings (id, administration_fee, administration_currency)
VALUES ('default', 0, 'ALL')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS payment_logs (
  id TEXT PRIMARY KEY,
  payment_date DATE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash', 'bank')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('EUR', 'ALL')),
  tenant_id TEXT,
  property_id TEXT,
  charge_type TEXT CHECK (charge_type IN ('rent', 'administration', 'parking', 'internet')),
  covered_month TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manager_expenses (
  id TEXT PRIMARY KEY,
  expense_month TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('EUR', 'ALL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
