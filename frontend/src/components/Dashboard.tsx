import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantApi, wishlistApi, type Restaurant, type WishlistItem } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { RestaurantForm, RestaurantCard } from '../features/restaurants/components';
import { WishlistForm, WishlistCard } from '../features/wishlist/components';
import { DashboardLayout } from '../features/dashboard/components';

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





  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      stats={stats}
      wishlistCount={wishlistCount}
      favorites={favorites}
      recent={recent}
      loading={loading}
    >
      {/* Contenu des onglets */}
      
      {/* Contenu Tableau de bord */}
      {activeTab === 'dashboard' && (
        <div className="tab-content animate-fade-in">
          <section className="mb-16">
            <RestaurantForm onSuccess={loadData} />
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
                  favorites.map(restaurant => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))
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
                  recent.map(restaurant => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))
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
            <WishlistForm onSuccess={() => {
              loadWishlist();
              loadWishlistCount();
            }} />
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
                  wishlistItems.map(item => (
                    <WishlistCard 
                      key={item.id} 
                      item={item}
                      onPromote={handlePromoteWishlistItem}
                      onDelete={handleDeleteWishlistItem}
                    />
                  ))
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
      
    </DashboardLayout>
  );
};

export default Dashboard;