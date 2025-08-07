import React, { memo, useMemo, useCallback } from 'react';

interface WishlistItem {
  id: number;
  name: string;
  city: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

interface WishlistCardProps {
  item: WishlistItem;
  onPromote?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (item: WishlistItem) => void;
  className?: string;
  showActions?: boolean;
}

// Priority color mapping
const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b', 
  low: '#10b981',
} as const;

// Priority label mapping
const PRIORITY_LABELS = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
} as const;

const WishlistCard: React.FC<WishlistCardProps> = memo(({
  item,
  onPromote,
  onDelete,
  onEdit,
  className = '',
  showActions = true,
}) => {
  // Memoize priority styling to avoid re-computation
  const priorityStyle = useMemo(() => {
    const color = PRIORITY_COLORS[item.priority] || '#6b7280';
    return {
      backgroundColor: `${color}20`,
      color,
      fontSize: '0.75rem'
    };
  }, [item.priority]);

  // Memoize priority label
  const priorityLabel = useMemo(() => 
    PRIORITY_LABELS[item.priority] || item.priority,
    [item.priority]
  );

  // Memoize formatted date
  const formattedDate = useMemo(() =>
    new Date(item.created_at).toLocaleDateString('fr-FR'),
    [item.created_at]
  );

  const handlePromote = useCallback(() => {
    onPromote?.(item.id);
  }, [onPromote, item.id]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" de votre wishlist ?`)) {
      onDelete?.(item.id);
    }
  }, [onDelete, item.id, item.name]);

  const handleEdit = useCallback(() => {
    onEdit?.(item);
  }, [onEdit, item]);

  return (
    <div className={`card ${className}`} style={{ padding: 'var(--space-lg)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-heading-3 mb-1">{item.name}</h3>
          <p className="text-body-sm">{item.city}</p>
          <div className="flex items-center gap-2 mt-2">
            <span 
              className="text-caption px-2 py-1 rounded-full"
              style={priorityStyle}
            >
              {priorityLabel}
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePromote}
              className="btn btn-ghost text-sm"
              title="Transformer en restaurant"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            
            {onEdit && (
              <button
                onClick={handleEdit}
                className="btn btn-ghost text-sm"
                title="Modifier"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            
            <button
              onClick={handleDelete}
              className="btn btn-ghost text-sm"
              style={{ color: '#ef4444' }}
              title="Supprimer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {item.notes && (
        <p className="text-body-sm" style={{ color: 'rgb(var(--color-secondary))' }}>
          {item.notes}
        </p>
      )}
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-caption" style={{ color: 'rgb(var(--color-muted))' }}>
          Ajouté le {formattedDate}
        </span>
      </div>
    </div>
  );
});

WishlistCard.displayName = 'WishlistCard';

export default WishlistCard;