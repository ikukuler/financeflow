import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase';

interface Credentials {
  email: string;
  password: string;
}

const resolveClient = () => {
  try {
    return { client: getSupabaseBrowserClient(), error: null as string | null };
  } catch (err) {
    return { client: null, error: err instanceof Error ? err.message : 'Failed to initialize Supabase client' };
  }
};

export const useSupabaseAuth = () => {
  const [{ client, error: initError }] = useState(resolveClient);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(initError);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    if (!client) {
      setIsLoading(false);
      return () => {
        disposed = true;
      };
    }

    const bootstrap = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (disposed) return;

      if (sessionError) {
        setError(sessionError.message);
      } else {
        setUser(session?.user ?? null);
      }

      setIsLoading(false);
    };

    void bootstrap();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (disposed) return;
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      disposed = true;
      subscription.unsubscribe();
    };
  }, [client]);

  const signIn = useCallback(
    async ({ email, password }: Credentials) => {
      if (!client) return false;

      setError(null);
      setInfo(null);

      const { error: signInError } = await client.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return false;
      }

      return true;
    },
    [client],
  );

  const signUp = useCallback(
    async ({ email, password }: Credentials) => {
      if (!client) return false;

      setError(null);
      setInfo(null);

      const { data, error: signUpError } = await client.auth.signUp({ email, password });

      if (signUpError) {
        setError(signUpError.message);
        return false;
      }

      if (!data.session) {
        setInfo('Account created. Check your email to confirm and then sign in.');
      }

      return true;
    },
    [client],
  );

  const signOut = useCallback(async () => {
    if (!client) return false;

    setError(null);
    setInfo(null);

    const { error: signOutError } = await client.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      return false;
    }

    return true;
  }, [client]);

  return {
    user,
    isLoading,
    error,
    info,
    signIn,
    signUp,
    signOut,
    clearError: () => setError(null),
    clearInfo: () => setInfo(null),
  };
};
