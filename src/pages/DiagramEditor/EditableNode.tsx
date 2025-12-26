import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNode } from '../../types';

export const EditableNode = memo(({ id, data, selected }: NodeProps<DiagramNode>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');

  const startEditing = useCallback(() => {
    setEditingLabel(data.label);
    setIsEditing(true);
  }, [data.label]);

  const saveLabel = useCallback(() => {
    if (data.onLabelChange && editingLabel !== data.label) {
      data.onLabelChange(id, editingLabel);
    }
    setIsEditing(false);
  }, [id, editingLabel, data]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveLabel();
    if (e.key === 'Escape') cancelEditing();
  }, [saveLabel, cancelEditing]);

  return (
    <div
      className={`
        relative min-w-[150px] p-3 bg-[var(--bg-secondary)] border-2 rounded-xl
        shadow-lg transition-all duration-200 hover:shadow-xl
        ${selected ? 'shadow-[0_0_0_2px_var(--accent-primary)]' : ''}
      `}
      style={{ borderColor: data.color || '#6366f1' }}
      onDoubleClick={startEditing}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-primary-500 !border-2 !border-[var(--bg-primary)]" />
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
        style={{ backgroundColor: data.color || '#6366f1' }}
      />
      
      {isEditing ? (
        <input
          type="text"
          value={editingLabel}
          onChange={(e) => setEditingLabel(e.target.value)}
          onBlur={saveLabel}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-sm font-medium text-center text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md outline-none focus:border-primary-500"
          autoFocus
        />
      ) : (
        <div className="text-sm font-medium text-center text-[var(--text-primary)] cursor-pointer select-none">
          {data.label}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-primary-500 !border-2 !border-[var(--bg-primary)]" />
    </div>
  );
});

EditableNode.displayName = 'EditableNode';
