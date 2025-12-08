-- Create salary_payments table
CREATE TABLE IF NOT EXISTS salary_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('salary', 'reimbursement')),
  period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  sent_by INTEGER NOT NULL,
  sent_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_salary_payments_employee_id ON salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_status ON salary_payments(status);
CREATE INDEX IF NOT EXISTS idx_salary_payments_created_at ON salary_payments(created_at);

-- Enable Row Level Security
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;

-- Create policies:
-- 1. Anyone can read confirmed payments (shared salary history)
CREATE POLICY "Anyone can view confirmed payments" ON salary_payments
  FOR SELECT USING (status = 'confirmed');

-- 2. Employees can only see their own pending payments
CREATE POLICY "Employees can view own pending payments" ON salary_payments
  FOR SELECT USING (
    status = 'pending' AND
    employee_id = auth.uid()::integer
  );

-- 3. Bosses can generate payments for employees
CREATE POLICY "Bosses can insert payments" ON salary_payments
  FOR INSERT WITH CHECK (
    -- This would need proper user authentication setup
    -- For now, we'll allow anyone to insert (you should restrict this in production)
    true
  );

-- 4. Employees can update their own payment status (confirm)
CREATE POLICY "Employees can confirm own payments" ON salary_payments
  FOR UPDATE USING (
    employee_id = auth.uid()::integer AND
    status = 'pending'
  );

-- Insert sample data (using the real amounts you provided)
INSERT INTO salary_payments (id, employee_id, employee_name, amount, type, period, status, sent_by, sent_by_name, created_at, confirmed_at) VALUES
  -- Real 2025 salary payments
  (gen_random_uuid(), 3, 'Larina', 32444.00, 'salary', 'October 2025', 'confirmed', 1, 'Ella', '2025-10-25 09:00:00', '2025-10-25 10:30:00'),
  (gen_random_uuid(), 3, 'Larina', 32444.00, 'salary', 'September 2025', 'confirmed', 1, 'Ella', '2025-09-25 09:00:00', '2025-09-25 10:30:00'),

  -- Real 2025 reimbursements
  (gen_random_uuid(), 3, 'Larina', 3859.00, 'reimbursement', 'November 2025', 'confirmed', 2, 'Paul', '2025-11-12 14:00:00', '2025-11-12 16:00:00'),
  (gen_random_uuid(), 3, 'Larina', 4639.00, 'reimbursement', 'September 2025', 'confirmed', 2, 'Paul', '2025-09-17 14:00:00', '2025-09-17 16:00:00'),
  (gen_random_uuid(), 3, 'Larina', 5611.00, 'reimbursement', 'September 2025', 'confirmed', 1, 'Ella', '2025-09-09 14:00:00', '2025-09-09 16:00:00'),
  (gen_random_uuid(), 3, 'Larina', 5186.00, 'reimbursement', 'September 2025', 'confirmed', 1, 'Ella', '2025-09-09 14:00:00', '2025-09-09 16:00:00'),

ON CONFLICT DO NOTHING;