import { useState, useEffect, useCallback } from 'react';
import {
  getUserDiagrams,
  getDiagram,
  createDiagram,
  updateDiagramContent,
  updateDiagramInfo,
  deleteDiagram,
  shareDiagram,
  removeAccess,
  getUserDiagramRole,
} from '../services/diagrams.ts';
import { findUserByEmail } from '../services/users';
import { useAuth } from './useAuth';
import type { DiagramDocument, DiagramNode, DiagramEdge, UserRole } from '../types';

interface UseDiagramsReturn {
  diagrams: DiagramDocument[];
  loading: boolean;
  error: string | null;
  refreshDiagrams: () => Promise<void>;
  createNewDiagram: (title: string, description?: string) => Promise<DiagramDocument>;
  removeDiagram: (id: string) => Promise<void>;
}

export const useDiagrams = (): UseDiagramsReturn => {
  const { user } = useAuth();
  const [diagrams, setDiagrams] = useState<DiagramDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDiagrams = useCallback(async () => {
    if (!user) {
      setDiagrams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userDiagrams = await getUserDiagrams(user.uid);
      setDiagrams(userDiagrams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load diagrams';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshDiagrams();
  }, [refreshDiagrams]);

  const createNewDiagram = async (title: string, description?: string): Promise<DiagramDocument> => {
    if (!user) {
      throw new Error('User must be logged in to create a diagram');
    }

    const newDiagram = await createDiagram(title, user.uid, user.email, description);
    setDiagrams((prev) => [newDiagram, ...prev]);
    return newDiagram;
  };

  const removeDiagram = async (id: string) => {
    await deleteDiagram(id);
    setDiagrams((prev) => prev.filter((d) => d.id !== id));
  };

  return {
    diagrams,
    loading,
    error,
    refreshDiagrams,
    createNewDiagram,
    removeDiagram,
  };
};

interface UseDiagramReturn {
  diagram: DiagramDocument | null;
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  refreshDiagram: () => Promise<void>;
  saveContent: (nodes: DiagramNode[], edges: DiagramEdge[]) => Promise<void>;
  saveInfo: (title: string, description?: string) => Promise<void>;
  shareWithUser: (email: string, role: UserRole) => Promise<void>;
  revokeAccess: (userId: string) => Promise<void>;
}

export const useDiagram = (diagramId: string | undefined): UseDiagramReturn => {
  const { user } = useAuth();
  const [diagram, setDiagram] = useState<DiagramDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDiagram = useCallback(async () => {
    if (!diagramId) {
      setDiagram(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedDiagram = await getDiagram(diagramId);
      setDiagram(fetchedDiagram);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load diagram';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [diagramId]);

  useEffect(() => {
    refreshDiagram();
  }, [refreshDiagram]);

  const userRole = diagram && user ? getUserDiagramRole(diagram, user.uid) : null;
  const canEdit = userRole === 'editor';

  const saveContent = async (nodes: DiagramNode[], edges: DiagramEdge[]) => {
    if (!diagramId || !canEdit) {
      throw new Error('Cannot save: no permission or diagram not found');
    }

    await updateDiagramContent(diagramId, nodes, edges);
    setDiagram((prev) => prev ? { ...prev, nodes, edges, updatedAt: new Date() } : null);
  };

  const saveInfo = async (title: string, description?: string) => {
    if (!diagramId || !canEdit) {
      throw new Error('Cannot save: no permission or diagram not found');
    }

    await updateDiagramInfo(diagramId, title, description);
    setDiagram((prev) => prev ? { ...prev, title, description, updatedAt: new Date() } : null);
  };

  const shareWithUser = async (email: string, role: UserRole) => {
    if (!diagramId || !canEdit) {
      throw new Error('Cannot share: no permission or diagram not found');
    }

    const targetUser = await findUserByEmail(email);
    if (!targetUser) {
      throw new Error('User not found with that email');
    }

    await shareDiagram(diagramId, email, targetUser.uid, role);
    await refreshDiagram();
  };

  const revokeAccess = async (userId: string) => {
    if (!diagramId || !canEdit) {
      throw new Error('Cannot revoke access: no permission or diagram not found');
    }

    await removeAccess(diagramId, userId);
    await refreshDiagram();
  };

  return {
    diagram,
    userRole,
    loading,
    error,
    canEdit,
    refreshDiagram,
    saveContent,
    saveInfo,
    shareWithUser,
    revokeAccess,
  };
};

