import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';

interface RegisterProps {
  onSwitchToLogin?: () => void;
  onRegistrationSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegistrationSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authApi.register(formData);
      
      // Successful registration - redirect to login with success message
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création du compte';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'var(--font-primary)', 
      backgroundColor: 'rgb(var(--color-background))', 
      padding: '1rem' 
    }}>
      <div className="card hover-lift animate-fade-in-up" style={{ 
        padding: 'var(--space-2xl)', 
        maxWidth: '28rem', 
        width: '100%' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1 className="text-display" style={{ marginBottom: 'var(--space-sm)' }}>
            Gourmestre
          </h1>
          <p className="text-body-sm">Créez votre compte pour commencer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Nom d'utilisateur"
              className="form-input"
              required
            />
            <label className="form-label">Nom d'utilisateur</label>
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mot de passe"
              className="form-input"
              required
            />
            <label className="form-label">Mot de passe</label>
          </div>
          
          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'loading-state' : ''}`}
            style={{ width: '100%' }}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {loading ? 'Création...' : 'Créer un compte'}
          </button>
        </form>

        {message && (
          <div 
            className="text-center animate-fade-in" 
            style={{ 
              color: 'rgb(var(--color-error))', 
              marginTop: 'var(--space-md)' 
            }}
          >
            {message}
          </div>
        )}

        {/* Lien vers la page de connexion */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--space-2xl)', 
          paddingTop: 'var(--space-lg)', 
          borderTop: '1px solid var(--border-subtle)' 
        }}>
          <p className="text-body-sm">
            Vous avez déjà un compte ?{' '}
            <button onClick={() => navigate('/login')} className="text-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;