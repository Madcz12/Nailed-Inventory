-- Enable RLS on main tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sale_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchase_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_adjustments" ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user ID
CREATE OR REPLACE FUNCTION current_user_id() RETURNS integer AS $$
  SELECT NULLIF(current_setting('app.current_user_id', TRUE), '')::integer;
$$ LANGUAGE sql STABLE;

-- Helper function to get the current user role
CREATE OR REPLACE FUNCTION current_user_role() RETURNS text AS $$
  SELECT current_setting('app.current_user_role', TRUE);
$$ LANGUAGE sql STABLE;

-- POLICIES FOR 'users'
CREATE POLICY "Admins can see all users" ON "users"
  FOR SELECT USING (current_user_role() = 'ADMIN');

CREATE POLICY "Users can see themselves" ON "users"
  FOR SELECT USING (id = current_user_id());

-- POLICIES FOR 'sales'
CREATE POLICY "Admins can manage all sales" ON "sales"
  FOR ALL USING (current_user_role() = 'ADMIN');

CREATE POLICY "Users can manage their own sales" ON "sales"
  FOR ALL USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

-- POLICIES FOR 'purchases'
CREATE POLICY "Admins can manage all purchases" ON "purchases"
  FOR ALL USING (current_user_role() = 'ADMIN');

CREATE POLICY "Users can manage their own purchases" ON "purchases"
  FOR ALL USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

-- POLICIES FOR 'sale_items' (via parent sale)
CREATE POLICY "Access sale items via sale" ON "sale_items"
  FOR ALL USING (
    current_user_role() = 'ADMIN' OR 
    EXISTS (SELECT 1 FROM sales WHERE id = sale_id AND user_id = current_user_id())
  );

-- POLICIES FOR 'purchase_items' (via parent purchase)
CREATE POLICY "Access purchase items via purchase" ON "purchase_items"
  FOR ALL USING (
    current_user_role() = 'ADMIN' OR 
    EXISTS (SELECT 1 FROM purchases WHERE id = purchase_id AND user_id = current_user_id())
  );

-- POLICIES FOR 'products' (PERMISSIVE for now since they don't have owner, but RLS is enabled for future)
CREATE POLICY "Everyone can see active products" ON "products"
  FOR SELECT USING (status = true OR current_user_role() = 'ADMIN');

CREATE POLICY "Admins can manage products" ON "products"
  FOR ALL USING (current_user_role() = 'ADMIN');

-- POLICIES FOR 'categories' (PERMISSIVE)
CREATE POLICY "Everyone can see active categories" ON "categories"
  FOR SELECT USING (status = true OR current_user_role() = 'ADMIN');

CREATE POLICY "Admins can manage categories" ON "categories"
  FOR ALL USING (current_user_role() = 'ADMIN');

-- POLICIES FOR 'inventory_adjustments'
CREATE POLICY "Admins can manage all adjustments" ON "inventory_adjustments"
  FOR ALL USING (current_user_role() = 'ADMIN');
