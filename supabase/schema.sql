-- ============================================================
-- FinanceTrack CO — Schema completo con RLS
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ─── Extensiones ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tipos ENUM ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('income', 'expense');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE debt_status AS ENUM ('active', 'paid', 'overdue');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Tabla: transactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      numeric(14,2) NOT NULL CHECK (amount > 0),
  type        transaction_type NOT NULL,
  category    varchar(50) NOT NULL,
  description text,
  date        date        NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS transactions_user_id_date_idx ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS transactions_user_id_type_idx ON transactions(user_id, type);

-- ─── Tabla: debts ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debts (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creditor_name  varchar(100) NOT NULL,
  total_amount   numeric(14,2) NOT NULL CHECK (total_amount > 0),
  paid_amount    numeric(14,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  interest_rate  numeric(5,2) CHECK (interest_rate >= 0),
  due_date       date,
  status         debt_status NOT NULL DEFAULT 'active',
  notes          text,
  created_at     timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS debts_user_id_status_idx ON debts(user_id, status);

-- ─── Tabla: debt_payments ────────────────────────────────────
CREATE TABLE IF NOT EXISTS debt_payments (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id      uuid        NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount       numeric(14,2) NOT NULL CHECK (amount > 0),
  payment_date date        NOT NULL DEFAULT CURRENT_DATE,
  note         text,
  created_at   timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS debt_payments_debt_id_idx ON debt_payments(debt_id);
CREATE INDEX IF NOT EXISTS debt_payments_user_id_idx ON debt_payments(user_id);

-- ─── Tabla: budgets ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category   varchar(50) NOT NULL,
  amount     numeric(14,2) NOT NULL CHECK (amount > 0),
  month      integer     NOT NULL CHECK (month BETWEEN 1 AND 12),
  year       integer     NOT NULL CHECK (year >= 2020),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, category, month, year)
);

CREATE INDEX IF NOT EXISTS budgets_user_id_month_year_idx ON budgets(user_id, year, month);

-- ─── Tabla: savings_goals ────────────────────────────────────
CREATE TABLE IF NOT EXISTS savings_goals (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           varchar(100) NOT NULL,
  target_amount  numeric(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date    date,
  emoji          varchar(10) NOT NULL DEFAULT '🎯',
  status         goal_status NOT NULL DEFAULT 'active',
  created_at     timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS savings_goals_user_id_status_idx ON savings_goals(user_id, status);

-- ─── Tabla: savings_contributions ───────────────────────────
CREATE TABLE IF NOT EXISTS savings_contributions (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id           uuid        NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount            numeric(14,2) NOT NULL CHECK (amount > 0),
  contribution_date date        NOT NULL DEFAULT CURRENT_DATE,
  note              text,
  created_at        timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS savings_contributions_goal_id_idx ON savings_contributions(goal_id);
CREATE INDEX IF NOT EXISTS savings_contributions_user_id_idx ON savings_contributions(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE transactions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets                ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_contributions  ENABLE ROW LEVEL SECURITY;

-- ─── Policies: transactions ──────────────────────────────────
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_update" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- ─── Policies: debts ─────────────────────────────────────────
CREATE POLICY "debts_select" ON debts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "debts_insert" ON debts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "debts_update" ON debts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "debts_delete" ON debts FOR DELETE USING (auth.uid() = user_id);

-- ─── Policies: debt_payments ─────────────────────────────────
CREATE POLICY "debt_payments_select" ON debt_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "debt_payments_insert" ON debt_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "debt_payments_update" ON debt_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "debt_payments_delete" ON debt_payments FOR DELETE USING (auth.uid() = user_id);

-- ─── Policies: budgets ───────────────────────────────────────
CREATE POLICY "budgets_select" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "budgets_insert" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budgets_update" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "budgets_delete" ON budgets FOR DELETE USING (auth.uid() = user_id);

-- ─── Policies: savings_goals ─────────────────────────────────
CREATE POLICY "savings_goals_select" ON savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "savings_goals_insert" ON savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "savings_goals_update" ON savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "savings_goals_delete" ON savings_goals FOR DELETE USING (auth.uid() = user_id);

-- ─── Policies: savings_contributions ────────────────────────
CREATE POLICY "savings_contributions_select" ON savings_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "savings_contributions_insert" ON savings_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "savings_contributions_update" ON savings_contributions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "savings_contributions_delete" ON savings_contributions FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Función: actualizar paid_amount en deuda al registrar pago
-- ============================================================
CREATE OR REPLACE FUNCTION update_debt_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE debts
  SET
    paid_amount = paid_amount + NEW.amount,
    status = CASE
      WHEN (paid_amount + NEW.amount) >= total_amount THEN 'paid'::debt_status
      WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE THEN 'overdue'::debt_status
      ELSE 'active'::debt_status
    END
  WHERE id = NEW.debt_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_debt_payment_insert
  AFTER INSERT ON debt_payments
  FOR EACH ROW EXECUTE FUNCTION update_debt_paid_amount();

-- ============================================================
-- Función: actualizar current_amount en meta al registrar aporte
-- ============================================================
CREATE OR REPLACE FUNCTION update_goal_current_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE savings_goals
  SET
    current_amount = current_amount + NEW.amount,
    status = CASE
      WHEN (current_amount + NEW.amount) >= target_amount THEN 'completed'::goal_status
      ELSE status
    END
  WHERE id = NEW.goal_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_savings_contribution_insert
  AFTER INSERT ON savings_contributions
  FOR EACH ROW EXECUTE FUNCTION update_goal_current_amount();
