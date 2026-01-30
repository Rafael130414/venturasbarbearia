import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // 0. BYPASS DE EMERGÊNCIA (Caso o Supabase bloqueie ou a senha mude sozinha)
    if (email === 'dono@venturas.com.br' && password === '123456') {
      setUser({
        id: 'emergency-owner',
        email: 'dono@venturas.com.br',
        user_metadata: { role: 'admin' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as any);
      return { error: null };
    }

    // 1. Tenta o login normal no servidor
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (!signInError) return { error: null };

    // 2. RECUPERAÇÃO: Caso não exista o usuário, ele cria e loga
    if (email === 'dono@venturas.com.br') {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (!signUpError && signUpData.session) return { error: null };
    }

    return { error: signInError };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, updatePassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
