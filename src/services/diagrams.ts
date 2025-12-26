import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    Timestamp,
  } from 'firebase/firestore';
  import { db } from './firebase';
  import type { DiagramDocument, DiagramNode, DiagramEdge, UserRole } from '../types';
  
  const DIAGRAMS_COLLECTION = 'diagrams';
  
  export const createDiagram = async (
    title: string,
    ownerId: string,
    ownerEmail: string,
    description?: string
  ): Promise<DiagramDocument> => {
    const docRef = doc(collection(db, DIAGRAMS_COLLECTION));
    
    const diagram: Omit<DiagramDocument, 'createdAt' | 'updatedAt'> & { 
      createdAt: ReturnType<typeof serverTimestamp>; 
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      id: docRef.id,
      title,
      description,
      ownerId,
      ownerEmail,
      nodes: [],
      edges: [],
      access: {
        [ownerId]: {
          role: 'editor',
          email: ownerEmail,
          addedAt: new Date(),
        },
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  
    await setDoc(docRef, diagram);
  
    return {
      ...diagram,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };
  
  export const getDiagram = async (id: string): Promise<DiagramDocument | null> => {
    const docRef = doc(db, DIAGRAMS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        ownerId: data.ownerId,
        ownerEmail: data.ownerEmail,
        nodes: data.nodes || [],
        edges: data.edges || [],
        access: data.access || {},
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
      };
    }
    return null;
  };
  
  export const getUserDiagrams = async (userId: string): Promise<DiagramDocument[]> => {
    const ownedQuery = query(
      collection(db, DIAGRAMS_COLLECTION),
      where('ownerId', '==', userId)
    );
    
    const ownedSnapshot = await getDocs(ownedQuery);
    const ownedDiagrams = ownedSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        ownerId: data.ownerId,
        ownerEmail: data.ownerEmail,
        nodes: data.nodes || [],
        edges: data.edges || [],
        access: data.access || {},
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
      } as DiagramDocument;
    });
  
    const allDiagramsSnapshot = await getDocs(collection(db, DIAGRAMS_COLLECTION));
    const sharedDiagrams = allDiagramsSnapshot.docs
      .filter((doc) => {
        const data = doc.data();
        return data.ownerId !== userId && data.access && data.access[userId];
      })
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          ownerId: data.ownerId,
          ownerEmail: data.ownerEmail,
          nodes: data.nodes || [],
          edges: data.edges || [],
          access: data.access || {},
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        } as DiagramDocument;
      });
  
    return [...ownedDiagrams, ...sharedDiagrams];
  };
  
  export const updateDiagramContent = async (
    id: string,
    nodes: DiagramNode[],
    edges: DiagramEdge[]
  ): Promise<void> => {
    const docRef = doc(db, DIAGRAMS_COLLECTION, id);
    await updateDoc(docRef, {
      nodes,
      edges,
      updatedAt: serverTimestamp(),
    });
  };
  
  export const updateDiagramInfo = async (
    id: string,
    title: string,
    description?: string
  ): Promise<void> => {
    const docRef = doc(db, DIAGRAMS_COLLECTION, id);
    await updateDoc(docRef, {
      title,
      description,
      updatedAt: serverTimestamp(),
    });
  };
  
  export const deleteDiagram = async (id: string): Promise<void> => {
    const docRef = doc(db, DIAGRAMS_COLLECTION, id);
    await deleteDoc(docRef);
  };
  
  export const shareDiagram = async (
    diagramId: string,
    userEmail: string,
    userId: string,
    role: UserRole
  ): Promise<void> => {
    const docRef = doc(db, DIAGRAMS_COLLECTION, diagramId);
    const diagram = await getDiagram(diagramId);
    
    if (!diagram) {
      throw new Error('Diagram not found');
    }
  
    const newAccess = {
      ...diagram.access,
      [userId]: {
        role,
        email: userEmail,
        addedAt: new Date(),
      },
    };
  
    await updateDoc(docRef, {
      access: newAccess,
      updatedAt: serverTimestamp(),
    });
  };
  
  export const removeAccess = async (
    diagramId: string,
    userId: string
  ): Promise<void> => {
    const docRef = doc(db, DIAGRAMS_COLLECTION, diagramId);
    const diagram = await getDiagram(diagramId);
    
    if (!diagram) {
      throw new Error('Diagram not found');
    }
  
    const newAccess = { ...diagram.access };
    delete newAccess[userId];
  
    await updateDoc(docRef, {
      access: newAccess,
      updatedAt: serverTimestamp(),
    });
  };
  
  export const getUserDiagramRole = (
    diagram: DiagramDocument,
    userId: string
  ): UserRole | null => {
    if (diagram.ownerId === userId) {
      return 'editor';
    }
    return diagram.access[userId]?.role || null;
  };
  
  