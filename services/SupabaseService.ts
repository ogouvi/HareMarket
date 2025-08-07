import { supabase } from '@/lib/supabase';

export interface Listing {
  id: string;
  croptype: string;
  quantity: string;
  unit: string;
  location: string;
  price: string;
  contact: string;
  description: string;
  dateposted: string;
  status: string;
  user_id?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  location: string;
  email: string;
  usertype: 'farmer' | 'buyer' | 'both';
  description: string;
  created_at?: string;
  updated_at?: string;
}

export class SupabaseService {
  // Listings
  static async getListings(): Promise<Listing[]> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('dateposted', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }

  static async addListing(listing: Omit<Listing, 'id'>): Promise<Listing | null> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([listing])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding listing:', error);
      return null;
    }
  }

  static async updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating listing:', error);
      return null;
    }
  }

  static async deleteListing(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      return false;
    }
  }

  // User Profiles
  static async getAllProfiles(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
      
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  static async saveProfile(profile: UserProfile): Promise<UserProfile | null> {
    try {
      const profileData = {
        ...profile,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving profile:', error);
      return null;
    }
  }

  static async createProfile(profile: UserProfile): Promise<UserProfile | null> {
    try {
      const profileData = {
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }

  static async updateProfile(profileId: string, profile: UserProfile): Promise<UserProfile | null> {
    try {
      const profileData = {
        ...profile,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  // Authentication
  static async     signUp(email: string, password: string, name: string): Promise<{ user: any; error: any }> {
    try {
      console.log('Starting signUp with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      console.log('Supabase signUp response:', { data, error });
      
      if (error) {
        console.error('SignUp error from Supabase:', error);
        return { user: null, error };
      }
      
      if (!data || !data.user) {
        console.error('SignUp failed: No user data returned');
        return { user: null, error: new Error('No user data returned from signup') };
      }
      
      console.log('SignUp success:', data.user);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('SignUp exception:', error);
      return { user: null, error };
    }
  }

  static async signIn(email: string, password: string): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { user: data.user, error };
    } catch (error) {
      return { user: null, error };
    }
  }

  static async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async getCurrentUser(): Promise<any> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async getSession(): Promise<any> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
} 