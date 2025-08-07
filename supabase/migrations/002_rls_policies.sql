-- Migration: 002_rls_policies.sql
-- Description: Row Level Security policies for listings and profiles
-- Created: 2024-01-01

-- Listings Policies

-- Allow anyone to read listings (public access)
CREATE POLICY "Enable read access for all users" ON listings
  FOR SELECT USING (true);

-- Allow authenticated users to insert listings
CREATE POLICY "Enable insert for authenticated users" ON listings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own listings
CREATE POLICY "Enable update for listing owners" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own listings
CREATE POLICY "Enable delete for listing owners" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Profiles Policies

-- Allow anyone to read profiles (public access)
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

-- Allow authenticated users to insert profiles
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own profile
CREATE POLICY "Enable update for profile owners" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Enable delete for profile owners" ON profiles
  FOR DELETE USING (auth.uid() = user_id); 