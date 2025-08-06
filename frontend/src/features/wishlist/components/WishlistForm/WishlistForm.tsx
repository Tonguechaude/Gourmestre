import React from 'react';
import { useWishlistForm } from '../../hooks';
import AutocompleteInput from '../../../../components/AutocompleteInput';

interface WishlistFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

const WishlistForm: React.FC<WishlistFormProps> = ({ 
  onSuccess, 
  onError, 
  className = "" 
}) => {
  const {
    formData,
    updateField,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useWishlistForm({ onSuccess, onError });

  return (
    <div className={`card ${className}`} style={{ padding: 'var(--space-2xl)' }}>
      <header className="mb-8">
        <h2 className="text-heading-2 mb-2 flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgb(var(--color-accent))' }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Ajouter à la wishlist
        </h2>
        <p className="text-body-sm">Ajoutez un restaurant que vous souhaitez essayer</p>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom du restaurant */}
          <div className="form-group">
            <AutocompleteInput
              value={formData.name}
              onChange={(value) => updateField('name', value)}
              onCityChange={(city) => updateField('city', city)}
              placeholder="Ex: Le Comptoir du Relais"
              label="Nom du restaurant"
              type="wishlist"
              required
            />
          </div>
          
          {/* Ville */}
          <div className="form-group">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ex: Paris"
              required
            />
            <label className="form-label">Ville</label>
          </div>
        </div>
        
        {/* Priorité */}
        <div className="form-group">
          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
          <label className="form-label">Priorité</label>
        </div>
        
        {/* Notes */}
        <div className="form-group">
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="form-input form-textarea"
            rows={3}
            placeholder="Pourquoi voulez-vous essayer ce restaurant ?"
          />
          <label className="form-label">Notes (optionnel)</label>
        </div>
        
        {/* Bouton d'envoi */}
        <div className="pt-4">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
            </svg>
            {isLoading ? 'Ajout en cours...' : 'Ajouter à la wishlist'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WishlistForm;