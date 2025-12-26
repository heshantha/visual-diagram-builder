import type { Node, Edge } from '@xyflow/react';
import type { UserRole } from './user';

export interface DiagramAccess {
  [userId: string]: {
    role: UserRole;
    email: string;
    addedAt: Date;
  };
}

export interface DiagramNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  onLabelChange?: (nodeId: string, newLabel: string) => void;
}

export type DiagramNode = Node<DiagramNodeData>;

export type DiagramEdge = Edge;

export interface DiagramDocument {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  ownerEmail: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  access: DiagramAccess;
  createdAt: Date;
  updatedAt: Date;
}

