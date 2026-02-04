-- Create roles enum type
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'ADMIN', 'CASHIER');

-- Create users_profile table
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  fullname VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'ADMIN',
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better query performance
CREATE INDEX idx_users_profile_role ON users_profile(role);
CREATE INDEX idx_users_profile_created_by ON users_profile(created_by);
CREATE INDEX idx_users_profile_is_active ON users_profile(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Superadmin can see all users
CREATE POLICY "superadmin_view_all_users" ON users_profile
  FOR SELECT
  USING (
    (SELECT role FROM users_profile WHERE id = auth.uid()) = 'SUPERADMIN'
  );

-- Admin can see themselves and their cashiers
CREATE POLICY "admin_view_own_and_cashiers" ON users_profile
  FOR SELECT
  USING (
    auth.uid() = id OR
    (
      (SELECT role FROM users_profile WHERE id = auth.uid()) = 'ADMIN' AND
      (SELECT created_by FROM users_profile WHERE id = auth.uid()::uuid) = auth.uid()
    )
  );

-- Cashier can only see themselves
CREATE POLICY "cashier_view_self" ON users_profile
  FOR SELECT
  USING (auth.uid() = id);

-- Superadmin can update all users
CREATE POLICY "superadmin_update_all_users" ON users_profile
  FOR UPDATE
  USING ((SELECT role FROM users_profile WHERE id = auth.uid()) = 'SUPERADMIN');

-- Admin can update their cashiers
CREATE POLICY "admin_update_own_cashiers" ON users_profile
  FOR UPDATE
  USING (
    (SELECT role FROM users_profile WHERE id = auth.uid()) = 'ADMIN' AND
    created_by = auth.uid()
  );

-- Superadmin can delete users
CREATE POLICY "superadmin_delete_users" ON users_profile
  FOR DELETE
  USING ((SELECT role FROM users_profile WHERE id = auth.uid()) = 'SUPERADMIN');

-- Superadmin can insert users (for creating accounts)
CREATE POLICY "superadmin_insert_users" ON users_profile
  FOR INSERT
  WITH CHECK ((SELECT role FROM users_profile WHERE id = auth.uid()) = 'SUPERADMIN');

-- Admin can insert cashiers
CREATE POLICY "admin_insert_cashiers" ON users_profile
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users_profile WHERE id = auth.uid()) = 'ADMIN' AND
    role = 'CASHIER' AND
    created_by = auth.uid()
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (id, fullname, role)
  VALUES (new.id, new.raw_user_meta_data->>'fullname', 'ADMIN');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
