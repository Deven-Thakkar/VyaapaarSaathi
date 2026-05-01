-- ================================================================
-- RLS POLICIES for VyapaarSaathi
-- Run this in Supabase SQL Editor after enabling RLS on all tables
-- ================================================================
-- HOW THIS WORKS:
-- 1. Backend server uses SUPABASE_KEY (service role) -> bypasses RLS automatically
-- 2. Frontend uses VITE_SUPABASE_ANON_KEY -> subject to these policies
-- ================================================================

-- ── HELPER: a function to get business_id for the current user ──
-- This avoids repeating the subquery in every policy
CREATE OR REPLACE FUNCTION get_my_business_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM businesses WHERE auth_user_id = auth.uid() LIMIT 1;
$$;


-- ================================================================
-- TABLE: businesses
-- Users can only see and edit THEIR OWN business row
-- ================================================================
CREATE POLICY "Users can view own business"
  ON businesses FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own business"
  ON businesses FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own business"
  ON businesses FOR UPDATE
  USING (auth_user_id = auth.uid());


-- ================================================================
-- TABLE: customers
-- Users can only access customers belonging to their business
-- ================================================================
CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  WITH CHECK (business_id = get_my_business_id());

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  USING (business_id = get_my_business_id());


-- ================================================================
-- TABLE: products
-- ================================================================
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (business_id = get_my_business_id());

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (business_id = get_my_business_id());


-- ================================================================
-- TABLE: sales
-- ================================================================
CREATE POLICY "Users can view own sales"
  ON sales FOR SELECT
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can insert own sales"
  ON sales FOR INSERT
  WITH CHECK (business_id = get_my_business_id());

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can delete own sales"
  ON sales FOR DELETE
  USING (business_id = get_my_business_id());


-- ================================================================
-- TABLE: sale_items
-- sale_items don't have business_id directly, they link via sale_id
-- ================================================================
CREATE POLICY "Users can view own sale_items"
  ON sale_items FOR SELECT
  USING (
    sale_id IN (
      SELECT id FROM sales WHERE business_id = get_my_business_id()
    )
  );

CREATE POLICY "Users can insert own sale_items"
  ON sale_items FOR INSERT
  WITH CHECK (
    sale_id IN (
      SELECT id FROM sales WHERE business_id = get_my_business_id()
    )
  );

CREATE POLICY "Users can delete own sale_items"
  ON sale_items FOR DELETE
  USING (
    sale_id IN (
      SELECT id FROM sales WHERE business_id = get_my_business_id()
    )
  );


-- ================================================================
-- TABLE: transactions
-- ================================================================
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (business_id = get_my_business_id());

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (business_id = get_my_business_id());


-- ================================================================
-- TABLE: udhaar_records
-- ================================================================
CREATE POLICY "Users can view own udhaar_records"
  ON udhaar_records FOR SELECT
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can insert own udhaar_records"
  ON udhaar_records FOR INSERT
  WITH CHECK (business_id = get_my_business_id());

CREATE POLICY "Users can update own udhaar_records"
  ON udhaar_records FOR UPDATE
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can delete own udhaar_records"
  ON udhaar_records FOR DELETE
  USING (business_id = get_my_business_id());


-- ================================================================
-- TABLE: business_reports
-- ================================================================
CREATE POLICY "Users can view own business_reports"
  ON business_reports FOR SELECT
  USING (business_id = get_my_business_id());

CREATE POLICY "Users can insert own business_reports"
  ON business_reports FOR INSERT
  WITH CHECK (business_id = get_my_business_id());

CREATE POLICY "Users can delete own business_reports"
  ON business_reports FOR DELETE
  USING (business_id = get_my_business_id());
