import {
    collection,
    query,
    where,
    getDocs,
  } from 'firebase/firestore';
  import { db } from './firebase';
  import type { UserDocument } from '../types';
  
  export const findUserByEmail = async (email: string): Promise<UserDocument | null> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      return null;
    }
  
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      uid: data.uid,
      email: data.email,
      role: data.role,
      createdAt: data.createdAt?.toDate() || new Date(),
      displayName: data.displayName,
    };
  };
  
  