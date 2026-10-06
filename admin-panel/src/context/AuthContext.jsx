import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isAdmin, loginToEmail, emailToLogin, ApiError } from '../lib/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const toUser = (authUser) => ({ username: emailToLogin(authUser.email), role: 'admin' });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let alive = true;

    // Restore a saved session on load; only admins get in.
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const authUser = data.session?.user;
        if (authUser && (await isAdmin(authUser.id))) {
          if (alive) setUser(toUser(authUser));
        }
      } catch {
        // Offline or the check failed: show the login screen.
      } finally {
        if (alive) setBooting(false);
      }
    })();

    // Session expired or signed out in another tab. (Supabase calls must not
    // be awaited inside this callback, so only plain state updates here.)
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setUser(null);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (username, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginToEmail(username),
      password,
    });
    if (error) throw new ApiError(error.message, error.code);
    if (!(await isAdmin(data.user.id))) {
      await supabase.auth.signOut();
      throw new ApiError('This account is not an admin.', 'not_admin');
    }
    setUser(toUser(data.user));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, booting, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
