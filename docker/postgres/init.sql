CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  due_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('EUR', 'ALL')),
  paid_at DATE
);
