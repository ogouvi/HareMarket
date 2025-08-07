# Supabase Integration Setup

This guide will help you set up Supabase as the backend for your Adja-oko app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note down your project URL and anon key

## 2. Environment Variables

Create a `.env` file in your project root with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Database Schema

Run these SQL commands in your Supabase SQL editor:

### Create Listings Table
```sql
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cropType TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT NOT NULL,
  location TEXT NOT NULL,
  price TEXT NOT NULL,
  contact TEXT NOT NULL,
  description TEXT,
  datePosted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Create Profiles Table
```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  userType TEXT CHECK (userType IN ('farmer', 'buyer', 'both')) DEFAULT 'farmer',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Row Level Security (RLS) Policies

### Enable RLS
```sql
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Listings Policies
```sql
-- Allow anyone to read listings
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
```

### Profiles Policies
```sql
-- Allow anyone to read profiles
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
```

## 5. Update Your App

### Wrap your app with AuthProvider

In your `app/_layout.tsx`:

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Your existing layout */}
    </AuthProvider>
  );
}
```

### Update your components to use SupabaseService

Replace `StorageService` calls with `SupabaseService` calls in your components.

## 6. Authentication Flow

The app now supports:
- User registration and login
- Session management
- User-specific data (listings and profiles)
- Automatic session persistence

## 7. Testing

1. Start your app: `npm run dev`
2. Test user registration and login
3. Test creating and viewing listings
4. Test profile management

## 8. Next Steps

- Add email verification
- Implement password reset
- Add social authentication (Google, Facebook, etc.)
- Add real-time updates for listings
- Implement push notifications

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure your `.env` file is in the project root
2. **RLS policies blocking access**: Check that your policies are correctly configured
3. **Authentication errors**: Verify your Supabase URL and anon key are correct

### Useful Commands

```bash
# Check if Supabase is properly configured
npx expo start --clear

# View logs for debugging
npx expo start --dev-client
``` 