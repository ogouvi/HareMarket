// Supabase Configuration
// Replace these values with your actual Supabase project credentials
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Check if configuration is set
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  console.error('❌ Supabase configuration is missing!');
  console.error('Please create a .env file with:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
}

// Database table names
export const TABLES = {
  LISTINGS: 'listings',
  PROFILES: 'profiles',
  USERS: 'auth.users',
} as const;

// RLS (Row Level Security) policies
export const POLICIES = {
  // Listings policies
  LISTINGS_SELECT: 'Enable read access for all users',
  LISTINGS_INSERT: 'Enable insert for authenticated users',
  LISTINGS_UPDATE: 'Enable update for listing owners',
  LISTINGS_DELETE: 'Enable delete for listing owners',
  
  // Profiles policies
  PROFILES_SELECT: 'Enable read access for all users',
  PROFILES_INSERT: 'Enable insert for authenticated users',
  PROFILES_UPDATE: 'Enable update for profile owners',
  PROFILES_DELETE: 'Enable delete for profile owners',
} as const; 