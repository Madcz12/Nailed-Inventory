-- Force RLS execution for the table owner (the 'postgres' user used by Prisma)
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "products" FORCE ROW LEVEL SECURITY;
ALTER TABLE "categories" FORCE ROW LEVEL SECURITY;
ALTER TABLE "sales" FORCE ROW LEVEL SECURITY;
ALTER TABLE "purchases" FORCE ROW LEVEL SECURITY;
ALTER TABLE "sale_items" FORCE ROW LEVEL SECURITY;
ALTER TABLE "purchase_items" FORCE ROW LEVEL SECURITY;
ALTER TABLE "inventory_adjustments" FORCE ROW LEVEL SECURITY;

-- Note: This ensures that even when connecting as 'postgres', 
-- the RLS policies are applied if app.current_user_id is set.
