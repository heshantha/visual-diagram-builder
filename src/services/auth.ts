import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User,
  } from 'firebase/auth';
  import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
  } from 'firebase/firestore';
  import { auth, db } from './firebase';
  import type { UserDocument, UserRole } from '../types';
  
  export const signUp = async (
    email: string,
    password: string,
    role: UserRole = 'editor'
  ): Promise<UserDocument> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
  
    const userDoc: Record<string, unknown> = {
      uid: user.uid,
      email: user.email || email,
      role,
      createdAt: serverTimestamp(),
    };
  
    if (user.displayName) {
      userDoc.displayName = user.displayName;
    }
  
    await setDoc(doc(db, 'users', user.uid), userDoc);
  
    return {
      uid: user.uid,
      email: user.email || email,
      role,
      createdAt: new Date(),
      displayName: user.displayName || undefined,
    };
  };
  
  export const signIn = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };
  
  export const logOut = async (): Promise<void> => {
    await signOut(auth);
  };
  
  export const getUserDocument = async (uid: string): Promise<UserDocument | null> => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt?.toDate() || new Date(),
        displayName: data.displayName,
      };
    }
    return null;
  };
  
  export const subscribeToAuthState = (
    callback: (user: User | null) => void
  ): (() => void) => {
    return onAuthStateChanged(auth, callback);
  };
  
  