import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantApi, wishlistApi, type Restaurant, type WishlistItem } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import AutocompleteInput from './AutocompleteInput';

interface Stats {
  total_restaurants: number;
  total_favorites: number;
  average_rating: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats>({
    total_restaurants: 0,
    total_favorites: 0,
    average_rating: '-'
  });
  const [wishlistCount, setWishlistCount] = useState(0);
  const [_restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [recent, setRecent] = useState<Restaurant[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    description: '',
    rating: 0,
    is_favorite: false
  });

  // Wishlist form state
  const [wishlistFormData, setWishlistFormData] = useState({
    name: '',
    city: '',
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadRestaurants(),
        loadFavorites(),
        loadRecent(),
        loadWishlist(),
        loadWishlistCount()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await restaurantApi.getStats();
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRestaurants = async () => {
    try {
      const response = await restaurantApi.getRestaurants();
      setRestaurants(response);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await restaurantApi.getFavorites();
      setFavorites(response);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadRecent = async () => {
    try {
      const response = await restaurantApi.getRecent(20);
      setRecent(response);
    } catch (error) {
      console.error('Error loading recent restaurants:', error);
    }
  };

  const loadWishlist = async () => {
    try {
      const response = await wishlistApi.getWishlist();
      setWishlistItems(response);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const loadWishlistCount = async () => {
    try {
      const response = await wishlistApi.getWishlistCount();
      setWishlistCount(response.count);
    } catch (error) {
      console.error('Error loading wishlist count:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await restaurantApi.createRestaurant(formData);
      
      // Reset form
      setFormData({
        name: '',
        city: '',
        description: '',
        rating: 0,
        is_favorite: false
      });
      
      // Reload data
      await loadData();
      
      // Show success feedback (you could add a toast notification here)
      console.log('Restaurant added successfully!');
    } catch (error) {
      console.error('Error adding restaurant:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleWishlistInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWishlistFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWishlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await wishlistApi.createWishlistItem(wishlistFormData);
      
      // Reset form
      setWishlistFormData({
        name: '',
        city: '',
        notes: '',
        priority: 'medium'
      });
      
      // Reload data
      await loadWishlist();
      await loadWishlistCount();
    } catch (error) {
      console.error('Error creating wishlist item:', error);
    }
  };

  const handlePromoteWishlistItem = async (id: number) => {
    try {
      await wishlistApi.promoteWishlistItem(id);
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error promoting wishlist item:', error);
    }
  };

  const handleDeleteWishlistItem = async (id: number) => {
    try {
      await wishlistApi.deleteWishlistItem(id);
      // Reload data
      await loadWishlist();
      await loadWishlistCount();
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      navigate('/login');
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`star ${star <= rating ? 'active' : ''}`}
            data-rating={star}
            fill="currentColor"
            viewBox="0 0 24 24"
            onClick={interactive ? () => handleStarClick(star) : undefined}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
    );
  };

  const renderRestaurantCard = (restaurant: Restaurant) => (
    <div key={restaurant.id} className="card" style={{ padding: 'var(--space-lg)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-heading-3 mb-1">{restaurant.name}</h3>
          <p className="text-body-sm">{restaurant.city}</p>
        </div>
        <div className="flex items-center gap-2">
          {renderStars(restaurant.rating)}
          {restaurant.is_favorite && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgb(var(--color-accent))' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
        </div>
      </div>
      {restaurant.description && (
        <p className="text-body-sm" style={{ color: 'rgb(var(--color-secondary))' }}>
          {restaurant.description}
        </p>
      )}
    </div>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  const renderWishlistCard = (item: WishlistItem) => (
    <div key={item.id} className="card" style={{ padding: 'var(--space-lg)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-heading-3 mb-1">{item.name}</h3>
          <p className="text-body-sm">{item.city}</p>
          <div className="flex items-center gap-2 mt-2">
            <span 
              className="text-caption px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: `${getPriorityColor(item.priority)}20`,
                color: getPriorityColor(item.priority),
                fontSize: '0.75rem'
              }}
            >
              {getPriorityLabel(item.priority)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePromoteWishlistItem(item.id)}
            className="btn btn-ghost text-sm"
            title="Transformer en restaurant"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button
            onClick={() => handleDeleteWishlistItem(item.id)}
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
      </div>
      {item.notes && (
        <p className="text-body-sm" style={{ color: 'rgb(var(--color-secondary))' }}>
          {item.notes}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'rgb(var(--color-background))', fontFamily: 'var(--font-primary)' }}>
      {/* Navigation Latérale */}
      <nav className="w-72 flex-shrink-0 bg-white border-r flex flex-col" style={{ borderColor: 'var(--border-subtle)' }}>
        
        {/* Logo & Titre */}
        <div className="p-8 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h1 className="text-display">Gourmestre</h1>
          <p className="text-body-sm mt-2">Votre carnet gastronomique</p>
        </div>
        
        {/* Menu Navigation */}
        <div className="flex-1 p-6 space-y-8">
          {/* Navigation principale */}
          <div>
            <h3 className="text-caption mb-4" style={{ color: 'rgb(var(--color-muted))', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                  <span className="text-body font-medium">Tableau de bord</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${activeTab === 'wishlist' ? 'active' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
                  </svg>
                  <span className="text-body font-medium">Wishlist</span>
                  <span className="text-caption bg-gray-100 px-2 py-1 rounded-full ml-auto" style={{ background: 'rgba(var(--color-accent), 0.1)', color: 'rgb(var(--color-accent))', fontSize: '0.75rem', minWidth: '1.5rem', textAlign: 'center' }}>
                    {wishlistCount}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Statistiques rapides */}
          <div>
            <h3 className="text-caption mb-4" style={{ color: 'rgb(var(--color-muted))', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Statistiques
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-body-sm">Restaurants</span>
                <span className="text-body font-semibold" style={{ color: 'rgb(var(--color-accent))' }}>
                  {stats.total_restaurants}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-body-sm">Favoris</span>
                <span className="text-body font-semibold" style={{ color: 'rgb(var(--color-accent))' }}>
                  {stats.total_favorites}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-body-sm">Note moyenne</span>
                <span className="text-body font-semibold" style={{ color: 'rgb(var(--color-accent))' }}>
                  {stats.average_rating}
                </span>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div>
            <h3 className="text-caption mb-4" style={{ color: 'rgb(var(--color-muted))', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Actions
            </h3>
            <ul className="space-y-2">
              <li>
                <button className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span className="text-body font-medium">Profil</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Section Déconnexion */}
        <div className="p-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <button 
            onClick={handleLogout}
            className="btn btn-ghost w-full justify-start"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Se déconnecter
          </button>
        </div>
      </nav>
      
      {/* Contenu Principal */}
      <main className="flex-1 flex">
        
        {/* Zone Centrale */}
        <div className="flex-1 p-8 max-w-4xl">
          
          {/* En-tête de bienvenue */}
          <header className="mb-8">
            <div className="animate-fade-in-up">
              <h1 className="text-display user-greeting">
                Bonjour {user?.username || 'Utilisateur'} !
              </h1>
              <p className="text-body-sm user-greeting" style={{ animationDelay: '0.1s' }}>
                Prêt à découvrir de nouveaux horizons culinaires ?
              </p>
            </div>
          </header>
          
          {/* Onglets Principaux */}
          <div className="mb-8">
            <div className="flex gap-2 bg-gray-50 rounded-lg p-1" style={{ background: 'rgba(var(--color-border), 0.3)', width: 'fit-content' }}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`tab-button px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                📊 Tableau de bord
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`tab-button px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'favorites' ? 'active' : ''}`}
              >
                ⭐ Favoris
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`tab-button px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'recent' ? 'active' : ''}`}
              >
                🕒 Récents
              </button>
            </div>
          </div>
          
          {/* Contenu des onglets */}
          <div id="tab-content">
            
            {/* Contenu Tableau de bord */}
            {activeTab === 'dashboard' && (
              <div className="tab-content animate-fade-in">
                <section className="mb-16">
                  <div className="card" style={{ padding: 'var(--space-2xl)' }}>
                    <header className="mb-8">
                      <h2 className="text-heading-2 mb-2">Ajouter un restaurant</h2>
                      <p className="text-body-sm">Enrichissez votre collection gastronomique</p>
                    </header>
                  
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Champs principaux */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <AutocompleteInput
                            value={formData.name}
                            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                            onCityChange={(city) => setFormData(prev => ({ ...prev, city }))}
                            placeholder="Nom du restaurant"
                            label="Nom du restaurant"
                            type="restaurants"
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Ville"
                            required
                          />
                          <label className="form-label">Ville</label>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="form-group">
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="form-input form-textarea"
                          placeholder="Votre avis, vos impressions..."
                          rows={4}
                        />
                        <label className="form-label">Description</label>
                      </div>
                      
                      {/* Notation et Favoris */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        {/* Système d'étoiles */}
                        <div className="form-group mb-0">
                          <label className="text-caption mb-3 block">Votre note</label>
                          {renderStars(formData.rating, true)}
                          <input type="hidden" name="rating" value={formData.rating} />
                        </div>
                        
                        {/* Checkbox Favoris */}
                        <div className="form-group mb-0">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              name="is_favorite"
                              checked={formData.is_favorite}
                              onChange={handleInputChange}
                              className="form-checkbox"
                            />
                            <span className="text-body">Ajouter aux favoris</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgb(var(--color-accent))' }}>
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </label>
                        </div>
                      </div>
                      
                      {/* Bouton d'envoi */}
                      <div className="pt-4">
                        <button type="submit" className="btn btn-primary">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                          </svg>
                          Ajouter ce restaurant
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
              </div>
            )}
            
            {/* Contenu Favoris */}
            {activeTab === 'favorites' && (
              <div className="tab-content animate-fade-in">
                <section>
                  <div className="card" style={{ padding: 'var(--space-2xl)' }}>
                    <header className="mb-8">
                      <h2 className="text-heading-2 mb-2 flex items-center gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgb(var(--color-accent))' }}>
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                        Vos restaurants favoris
                      </h2>
                      <p className="text-body-sm">Vos adresses incontournables</p>
                    </header>
                    
                    <div className="space-y-4">
                      {loading ? (
                        <>
                          <div className="skeleton" style={{ height: '5rem' }}></div>
                          <div className="skeleton" style={{ height: '5rem' }}></div>
                          <div className="skeleton" style={{ height: '5rem' }}></div>
                        </>
                      ) : favorites.length > 0 ? (
                        favorites.map(renderRestaurantCard)
                      ) : (
                        <div className="text-center py-12" style={{ color: 'rgb(var(--color-muted))' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto var(--space-md)', color: 'rgb(var(--color-border))' }}>
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                          </svg>
                          <p className="text-body-sm">Aucun restaurant favori pour le moment.</p>
                          <p className="text-caption mt-2">Ajoutez vos premiers favoris depuis le tableau de bord !</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}
            
            {/* Contenu Récents */}
            {activeTab === 'recent' && (
              <div className="tab-content animate-fade-in">
                <section>
                  <div className="card" style={{ padding: 'var(--space-2xl)' }}>
                    <header className="mb-8">
                      <h2 className="text-heading-2 mb-2 flex items-center gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgb(var(--color-accent))' }}>
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        Ajouts récents
                      </h2>
                      <p className="text-body-sm">Vos dernières découvertes</p>
                    </header>
                    
                    <div className="space-y-4">
                      {loading ? (
                        <>
                          <div className="skeleton" style={{ height: '5rem' }}></div>
                          <div className="skeleton" style={{ height: '5rem' }}></div>
                          <div className="skeleton" style={{ height: '5rem' }}></div>
                          <div className="skeleton" style={{ height: '5rem' }}></div>
                        </>
                      ) : recent.length > 0 ? (
                        recent.map(renderRestaurantCard)
                      ) : (
                        <div className="text-center py-12" style={{ color: 'rgb(var(--color-muted))' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto var(--space-md)', color: 'rgb(var(--color-border))' }}>
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                          </svg>
                          <p className="text-body-sm">Aucun restaurant ajouté pour le moment.</p>
                          <p className="text-caption mt-2">Commencez par ajouter votre premier restaurant !</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}
            
            {/* Contenu Wishlist */}
            {activeTab === 'wishlist' && (
              <div className="tab-content animate-fade-in">
                {/* Formulaire d'ajout wishlist */}
                <section className="mb-8">
                  <div className="card" style={{ padding: 'var(--space-2xl)' }}>
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
                    
                    <form onSubmit={handleWishlistSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nom du restaurant */}
                        <div className="form-group">
                          <AutocompleteInput
                            value={wishlistFormData.name}
                            onChange={(value) => setWishlistFormData(prev => ({ ...prev, name: value }))}
                            onCityChange={(city) => setWishlistFormData(prev => ({ ...prev, city }))}
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
                            value={wishlistFormData.city}
                            onChange={handleWishlistInputChange}
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
                          value={wishlistFormData.priority}
                          onChange={handleWishlistInputChange}
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
                          value={wishlistFormData.notes}
                          onChange={handleWishlistInputChange}
                          className="form-input form-textarea"
                          rows={3}
                          placeholder="Pourquoi voulez-vous essayer ce restaurant ?"
                        />
                        <label className="form-label">Notes (optionnel)</label>
                      </div>
                      
                      {/* Bouton d'envoi */}
                      <div className="pt-4">
                        <button type="submit" className="btn btn-primary">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
                          </svg>
                          Ajouter à la wishlist
                        </button>
                      </div>
                    </form>
                  </div>
                </section>

                {/* Liste des éléments de wishlist */}
                <section>
                  <div className="card" style={{ padding: 'var(--space-2xl)' }}>
                    <header className="mb-8">
                      <h2 className="text-heading-2 mb-2 flex items-center gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgb(var(--color-accent))' }}>
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
                        </svg>
                        Ma Wishlist
                      </h2>
                      <p className="text-body-sm">Restaurants que vous souhaitez essayer</p>
                    </header>
                    
                    <div className="space-y-4">
                      {loading ? (
                        <>
                          <div className="skeleton" style={{ height: '6rem' }}></div>
                          <div className="skeleton" style={{ height: '6rem' }}></div>
                          <div className="skeleton" style={{ height: '6rem' }}></div>
                        </>
                      ) : wishlistItems.length > 0 ? (
                        wishlistItems.map(renderWishlistCard)
                      ) : (
                        <div className="text-center py-12" style={{ color: 'rgb(var(--color-muted))' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto var(--space-md)', color: 'rgb(var(--color-border))' }}>
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
                          </svg>
                          <p className="text-body-sm">Votre wishlist est vide.</p>
                          <p className="text-caption mt-2">Utilisez le formulaire ci-dessus pour ajouter votre premier restaurant !</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}
            
          </div>
        </div>
        
        {/* Colonne Droite - Activité */}
        <aside className="w-80 flex-shrink-0 p-8 border-l" style={{ borderColor: 'var(--border-subtle)' }}>
          
          {/* Dernier Favori */}
          <section className="mb-8">
            <div className="card-minimal" style={{ padding: 'var(--space-lg)' }}>
              <header className="mb-4">
                <h3 className="text-heading-3 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgb(var(--color-accent))' }}>
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                  Dernier favori
                </h3>
              </header>
              
              <div className="animate-fade-in">
                {loading ? (
                  <>
                    <div className="skeleton" style={{ height: '1.5rem', marginBottom: '0.5rem' }}></div>
                    <div className="skeleton" style={{ height: '1rem', width: '70%', marginBottom: '1rem' }}></div>
                    <div className="skeleton" style={{ height: '3rem' }}></div>
                  </>
                ) : favorites.length > 0 ? (
                  <div>
                    <h4 className="text-body font-semibold mb-1">{favorites[0].name}</h4>
                    <p className="text-body-sm mb-2">{favorites[0].city}</p>
                    {renderStars(favorites[0].rating)}
                  </div>
                ) : (
                  <p className="text-body-sm" style={{ color: 'rgb(var(--color-muted))' }}>
                    Aucun favori pour le moment
                  </p>
                )}
              </div>
            </div>
          </section>
          
          {/* Ajouts Récents */}
          <section>
            <div className="card-minimal" style={{ padding: 'var(--space-lg)' }}>
              <header className="mb-4">
                <h3 className="text-heading-3 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgb(var(--color-accent))' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  Ajouts récents
                </h3>
              </header>
              
              <div className="animate-fade-in">
                {loading ? (
                  <div className="space-y-3">
                    <div className="skeleton" style={{ height: '2.5rem' }}></div>
                    <div className="skeleton" style={{ height: '2.5rem' }}></div>
                    <div className="skeleton" style={{ height: '2.5rem' }}></div>
                  </div>
                ) : recent.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {recent.slice(0, 5).map(restaurant => (
                      <div key={restaurant.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-body-sm font-medium">{restaurant.name}</p>
                          <p className="text-caption">{restaurant.city}</p>
                        </div>
                        {renderStars(restaurant.rating)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-sm" style={{ color: 'rgb(var(--color-muted))' }}>
                    Aucun restaurant pour le moment
                  </p>
                )}
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
};

export default Dashboard;