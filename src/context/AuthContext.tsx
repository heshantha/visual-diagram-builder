import { useEffect, useState, type ReactNode } from 'react';
import { type User } from 'firebase/auth';
import { subscribeToAuthState, getUserDocument, signIn, signUp, logOut } from '../services/auth';
import type { UserDocument, UserRole } from '../types';
import { AuthContext } from './authContextDef.ts';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserDocument | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          const userDoc = await getUserDocument(fbUser.uid);
          setUser(userDoc);
        } catch (err) {
          console.error('Error fetching user document:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, role: UserRole = 'editor') => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await signUp(email, password, role);
      setUser(newUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await logOut();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log out';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        logOut: handleLogOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
