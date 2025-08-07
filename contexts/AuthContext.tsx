import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { SupabaseService } from '@/services/SupabaseService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: any;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔧 Initializing auth...');
        
        // Test connection
        const isConnected = await supabase.auth.getSession();
        if (!isConnected) {
          throw new Error('Supabase connection failed');
        }
        
        // Retrieve the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log('🔧 Current session:', currentSession ? 'Found' : 'None');
        
        // Update state with current session
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (err) {
        setError(err);
        console.error('❌ Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        try {
          console.log('🔧 Auth state change:', event, newSession?.user?.id);
          
          // Update state with new session
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
          } else {
            // If no session, reset user and session
            setSession(null);
            setUser(null);
          }
          
          setError(null);
        } catch (err) {
          setError(err);
          console.error('❌ Error in auth state change:', err);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Rest of the code remains the same as in your original implementation
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔧 Starting signIn for:', email);
      const result = await SupabaseService.signIn(email, password);
      if (result.error) {
        setError(result.error);
        console.error('❌ SignIn error:', result.error);
      } else {
        setError(null);
        console.log('✅ SignIn successful');
      }
      return result;
    } catch (err) {
      setError(err);
      console.error('❌ Error in signIn:', err);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔧 Starting signUp for:', email);
      const result = await SupabaseService.signUp(email, password, name);
      console.log('🔧 SignUp result:', result);
      
      if (result.error) {
        setError(result.error);
        console.error('❌ SignUp error:', result.error);
      } else {
        setError(null);
        console.log('✅ SignUp successful');
      }
      return result;
    } catch (err) {
      setError(err);
      console.error('❌ Error in signUp:', err);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await SupabaseService.signOut();
      setUser(null);
      setSession(null);
      console.log('✅ SignOut successful');
    } catch (err) {
      setError(err);
      console.error('❌ Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};