# Supabase Migrations

This directory contains all the database migrations for the Adja-oko app.

## Migration Files

### 001_initial_schema.sql
- Creates the main database tables (`listings`, `profiles`)
- Enables Row Level Security (RLS)
- Creates indexes for better performance
- Sets up automatic `updated_at` triggers

### 002_rls_policies.sql
- Implements Row Level Security policies
- Allows public read access to listings and profiles
- Restricts write operations to authenticated users
- Ensures users can only modify their own data

### 003_seed_data.sql
- Inserts sample listings for testing
- Creates utility functions for development
- Adds sample data that's visible to all users

### 004_functions_and_triggers.sql
- Phone number validation and formatting
- Search functionality for listings
- User-specific listing retrieval
- Database-level validation triggers

## How to Apply Migrations

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run each migration file in order (001, 002, 003, 004)
4. Execute them one by one

### Option 2: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Manual Execution
Copy and paste each migration file content into the Supabase SQL Editor and execute them in order.

## Migration Order
Always run migrations in this order:
1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_seed_data.sql`
4. `004_functions_and_triggers.sql`

## Verification
After running all migrations, you should have:
- ✅ `listings` table with RLS enabled
- ✅ `profiles` table with RLS enabled
- ✅ Sample data visible in the dashboard
- ✅ Working authentication and authorization
- ✅ Phone number validation
- ✅ Search functionality

## Rollback
If you need to rollback changes, you can drop the tables:
```sql
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

## Development
For development, you can modify the seed data in `003_seed_data.sql` to add more sample listings or change the data structure.

## Production
Before deploying to production:
1. Remove or modify the sample data in `003_seed_data.sql`
2. Review and adjust RLS policies if needed
3. Test all functionality thoroughly 