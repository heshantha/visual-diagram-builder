import { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Plus, ArrowLeft, Share2, Loader2, AlertCircle, Edit3, Eye, Trash2, X } from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { useDiagram } from '../../hooks/useDiagrams';
import { useTheme } from '../../hooks/useTheme';
import type { DiagramNode, DiagramEdge, UserRole } from '../../types';
import { EditableNode } from './EditableNode';

const nodeTypes = { default: EditableNode };

const NODE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export const DiagramEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { diagram, loading, error, canEdit, saveContent, shareWithUser, revokeAccess } = useDiagram(id);
  
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [edges, setEdges] = useState<DiagramEdge[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<UserRole>('viewer');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(NODE_COLORS[0]);
  
  const nodeIdRef = useRef(1);

  const handleLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node
      )
    );
    setHasChanges(true);
  }, []);

  useEffect(() => {
    if (diagram) {
      setNodes(diagram.nodes);
      setEdges(diagram.edges);
      const maxId = diagram.nodes.reduce((max, node) => {
        const numId = parseInt(node.id.replace('node-', ''), 10);
        return isNaN(numId) ? max : Math.max(max, numId);
      }, 0);
      nodeIdRef.current = maxId + 1;
    }
  }, [diagram]);

  const nodesWithCallbacks = nodes.map((node) => ({
    ...node,
    data: { ...node.data, onLabelChange: handleLabelChange },
  }));

  const onNodesChange = useCallback((changes: NodeChange<DiagramNode>[]) => {
    if (!canEdit) return;
    setNodes((nds) => applyNodeChanges(changes, nds));
    setHasChanges(true);
  }, [canEdit]);

  const onEdgesChange = useCallback((changes: EdgeChange<DiagramEdge>[]) => {
    if (!canEdit) return;
    setEdges((eds) => applyEdgeChanges(changes, eds));
    setHasChanges(true);
  }, [canEdit]);

  const onConnect = useCallback((connection: Connection) => {
    if (!canEdit) return;
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'var(--accent-primary)', strokeWidth: 2 },
    }, eds));
    setHasChanges(true);
  }, [canEdit]);

  const addNode = useCallback(() => {
    if (!canEdit) return;
    const newNode: DiagramNode = {
      id: `node-${nodeIdRef.current++}`,
      type: 'default',
      position: { x: 250 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: 'New Node', color: selectedColor },
    };
    setNodes((nds) => [...nds, newNode]);
    setHasChanges(true);
  }, [canEdit, selectedColor]);

  const handleSave = async () => {
    if (!canEdit || !hasChanges) return;
    setIsSaving(true);
    try {
      await saveContent(nodes, edges);
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) return;
    setShareLoading(true);
    setShareError(null);
    try {
      await shareWithUser(shareEmail.trim(), shareRole);
      setShareEmail('');
      setShowShareModal(false);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : 'Failed to share diagram');
    } finally {
      setShareLoading(false);
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    try { await revokeAccess(userId); } catch (err) { console.error('Failed to revoke access:', err); }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[var(--text-tertiary)]">
          <Loader2 size={40} className="animate-spin text-primary-500" />
          <p>Loading diagram...</p>
        </div>
      </Layout>
    );
  }

  if (error || !diagram) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
          <AlertCircle size={48} className="text-red-500" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Diagram not found</h2>
          <p className="text-[var(--text-tertiary)]">{error || 'The diagram does not exist or you do not have access.'}</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNavbar={false}>
      <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={18} />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">{diagram.title}</h1>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${
                canEdit ? 'bg-emerald-500/15 text-emerald-500' : 'bg-primary-500/15 text-primary-500'
              }`}>
                {canEdit ? <Edit3 size={12} /> : <Eye size={12} />}
                {canEdit ? 'Editor' : 'Viewer'}
              </span>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg">
                {NODE_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                      selectedColor === color ? 'border-[var(--text-primary)] scale-125' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    title="Node color"
                  />
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={addNode}><Plus size={18} /> Add Node</Button>
              <Button variant="secondary" size="sm" onClick={() => setShowShareModal(true)}><Share2 size={18} /> Share</Button>
              <Button size="sm" onClick={handleSave} loading={isSaving} disabled={!hasChanges}><Save size={18} /> Save</Button>
            </div>
          )}
        </div>

        <div className="flex-1">
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            nodesDraggable={canEdit}
            nodesConnectable={canEdit}
            elementsSelectable={canEdit}
            fitView
            colorMode={theme}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <Controls />
            <MiniMap nodeColor={(node) => (node.data as { color?: string }).color || '#6366f1'} maskColor={theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'} />
            
            {!canEdit && (
              <Panel position="top-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary-500/15 text-primary-500 text-sm font-medium rounded-lg">
                  <Eye size={16} /> View Only Mode
                </div>
              </Panel>
            )}
            
            {hasChanges && canEdit && (
              <Panel position="bottom-center">
                <div className="px-4 py-2 bg-amber-500/15 text-amber-500 text-sm font-medium rounded-lg">
                  You have unsaved changes
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {showShareModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[var(--text-primary)]">Share Diagram</h3>
                  <button onClick={() => setShowShareModal(false)} className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                {shareError && <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg text-sm mb-4">{shareError}</div>}
                
                <div className="flex flex-col gap-4 mb-6">
                  <Input label="Email Address" placeholder="colleague@example.com" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Permission</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['viewer', 'editor'] as const).map((r) => (
                        <button
                          key={r}
                          className={`flex items-center justify-center gap-2 py-3 text-sm font-medium border-2 rounded-lg cursor-pointer transition-all ${
                            shareRole === r ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-primary-500'
                          }`}
                          onClick={() => setShareRole(r)}
                        >
                          {r === 'viewer' ? <Eye size={16} /> : <Edit3 size={16} />}
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-[var(--border-color)] pt-4">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">People with access</h4>
                  {Object.entries(diagram.access).map(([userId, access]) => (
                    <div key={userId} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-b-0">
                      <div className="flex flex-col">
                        <span className="text-sm text-[var(--text-primary)]">{access.email}</span>
                        <span className="text-xs text-[var(--text-tertiary)] capitalize">{access.role}</span>
                      </div>
                      {userId !== diagram.ownerId && (
                        <button onClick={() => handleRevokeAccess(userId)} className="p-1.5 bg-red-500/10 rounded-md text-red-500 hover:bg-red-500/20 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" onClick={() => setShowShareModal(false)}>Cancel</Button>
                <Button onClick={handleShare} loading={shareLoading} disabled={!shareEmail.trim()}>Share</Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};
