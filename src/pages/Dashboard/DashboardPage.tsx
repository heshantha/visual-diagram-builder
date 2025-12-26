import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Workflow, Calendar, User, Trash2, Edit3, Eye, Loader2 } from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useDiagrams } from '../../hooks/useDiagrams.ts';
import { useAuth } from '../../hooks/useAuth';
import { getUserDiagramRole } from '../../services/diagrams.ts';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { diagrams, loading, error, createNewDiagram, removeDiagram } = useDiagrams();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreateLoading(true);
    try {
      const diagram = await createNewDiagram(newTitle.trim(), newDescription.trim() || undefined);
      setIsCreating(false);
      setNewTitle('');
      setNewDescription('');
      navigate(`/diagram/${diagram.id}`);
    } catch (err) {
      console.error('Failed to create diagram:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this diagram?')) {
      setDeleteId(id);
      try {
        await removeDiagram(id);
      } catch (err) {
        console.error('Failed to delete diagram:', err);
      } finally {
        setDeleteId(null);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const canCreateDiagram = user?.role === 'editor';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">My Diagrams</h1>
            <p className="text-[var(--text-tertiary)]">
              {diagrams.length === 0 
                ? 'Create your first diagram to get started' 
                : `${diagrams.length} diagram${diagrams.length === 1 ? '' : 's'} in your workspace`}
            </p>
          </div>
          {canCreateDiagram && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus size={20} />
              New Diagram
            </Button>
          )}
        </div>

        {isCreating && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CardContent>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Create New Diagram</h3>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Diagram Title"
                    placeholder="Enter a title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                  />
                  <Input
                    label="Description (optional)"
                    placeholder="Add a description..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button onClick={handleCreate} loading={createLoading} disabled={!newTitle.trim()}>Create</Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-tertiary)] gap-4">
            <Loader2 size={40} className="animate-spin" />
            <p>Loading your diagrams...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl">
            {error}
          </div>
        )}

        {!loading && !error && diagrams.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 px-8 bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-color)] rounded-3xl gap-4">
            <div className="flex items-center justify-center w-28 h-28 bg-gradient-to-br from-primary-500/10 to-secondary/10 rounded-full text-primary-500 mb-4">
              <Workflow size={64} />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">No diagrams yet</h2>
            <p className="text-[var(--text-tertiary)] max-w-sm">
              {canCreateDiagram 
                ? 'Create your first diagram to start visualizing your ideas' 
                : 'Diagrams shared with you will appear here'}
            </p>
            {canCreateDiagram && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus size={20} />
                Create Diagram
              </Button>
            )}
          </div>
        )}

        {!loading && !error && diagrams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagrams.map((diagram) => {
              const role = user ? getUserDiagramRole(diagram, user.uid) : null;
              const isOwner = diagram.ownerId === user?.uid;
              const isDeleting = deleteId === diagram.id;
              
              return (
                <Card
                  key={diagram.id}
                  hoverable
                  onClick={() => navigate(`/diagram/${diagram.id}`)}
                  className="cursor-pointer"
                >
                  <CardContent>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary rounded-xl text-white">
                        <Workflow size={24} />
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold capitalize rounded-full ${
                        role === 'editor' 
                          ? 'bg-emerald-500/15 text-emerald-500' 
                          : 'bg-primary-500/15 text-primary-500'
                      }`}>
                        {role === 'editor' ? <Edit3 size={12} /> : <Eye size={12} />}
                        {role}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 truncate">
                      {diagram.title}
                    </h3>
                    {diagram.description && (
                      <p className="text-sm text-[var(--text-tertiary)] mb-4 line-clamp-2">
                        {diagram.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 mb-3 text-xs text-[var(--text-tertiary)]">
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span>{isOwner ? 'You' : diagram.ownerEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{formatDate(diagram.updatedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  {isOwner && (
                    <CardFooter>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => handleDelete(diagram.id, e)}
                        loading={isDeleting}
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
