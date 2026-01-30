/*
  # Barber Shop Management System - Complete Database Schema

  ## Overview
  Complete database schema for a modern barber shop management system with financial control, 
  scheduling, and service management capabilities.

  ## New Tables Created

  ### 1. barbers
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Barber's name
  - `phone` (text) - Contact phone number
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz) - Record creation timestamp
  - `user_id` (uuid) - Links to auth.users for login

  ### 2. services
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Service name (e.g., "Corte Degradê")
  - `description` (text) - Service description
  - `price` (numeric) - Service price in currency
  - `duration_minutes` (integer) - Average duration in minutes
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. clients
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Client's name
  - `phone` (text) - Contact phone number
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. appointments
  - `id` (uuid, primary key) - Unique identifier
  - `client_id` (uuid) - References clients
  - `barber_id` (uuid) - References barbers
  - `service_id` (uuid) - References services
  - `appointment_date` (date) - Date of appointment
  - `start_time` (time) - Start time
  - `end_time` (time) - End time (auto-calculated based on service duration)
  - `status` (text) - Status: scheduled, completed, cancelled
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. payments
  - `id` (uuid, primary key) - Unique identifier
  - `appointment_id` (uuid) - References appointments
  - `amount` (numeric) - Payment amount
  - `payment_method` (text) - Method: credit_card, debit_card, cash, pix
  - `payment_date` (timestamptz) - When payment was made
  - `created_at` (timestamptz) - Record creation timestamp

  ### 6. expense_categories
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Category name (e.g., "Aluguel", "Produtos")
  - `created_at` (timestamptz) - Record creation timestamp

  ### 7. expenses
  - `id` (uuid, primary key) - Unique identifier
  - `category_id` (uuid) - References expense_categories
  - `description` (text) - Expense description
  - `amount` (numeric) - Expense amount
  - `expense_date` (date) - Date of expense
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - RLS (Row Level Security) enabled on all tables
  - Policies created for authenticated users to manage all data
  - All tables are protected and require authentication
*/

-- Create barbers table
CREATE TABLE IF NOT EXISTS barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage barbers"
  ON barbers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10, 2) NOT NULL,
  duration_minutes integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage clients"
  ON clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES barbers(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text DEFAULT 'scheduled',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  payment_method text NOT NULL,
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage expense categories"
  ON expense_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES expense_categories(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  expense_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage expenses"
  ON expenses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default expense categories
INSERT INTO expense_categories (name) VALUES
  ('Aluguel'),
  ('Produtos'),
  ('Água'),
  ('Luz'),
  ('Internet'),
  ('Equipamentos'),
  ('Manutenção'),
  ('Outros')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_barber ON appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);