import React from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardActivity from './DashboardActivity';

interface Stats {
  total_restaurants: number;
  total_favorites: number;
  average_rating: string;
}

interface Restaurant {
  id: number;
  name: string;
  city: string;
  rating: number;
}

interface DashboardLayoutProps {
  user?: { username: string } | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  stats: Stats;
  wishlistCount: number;
  favorites: Restaurant[];
  recent: Restaurant[];
  loading: boolean;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  activeTab,
  onTabChange,
  onLogout,
  stats,
  wishlistCount,
  favorites,
  recent,
  loading,
  children,
}) => {
  return (
    <div className="min-h-screen flex" style={{ background: 'rgb(var(--color-background))', fontFamily: 'var(--font-primary)' }}>
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogout={onLogout}
        stats={stats}
        wishlistCount={wishlistCount}
      />
      
      <main className="flex-1 flex">
        <div className="flex-1 p-8 max-w-4xl">
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
          
          <div className="mb-8">
            <div className="flex gap-2 bg-gray-50 rounded-lg p-1" style={{ background: 'rgba(var(--color-border), 0.3)', width: 'fit-content' }}>
              <button
                onClick={() => onTabChange('dashboard')}
                className={`tab-button px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                📊 Tableau de bord
              </button>
              <button
                onClick={() => onTabChange('favorites')}
                className={`tab-button px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'favorites' ? 'active' : ''}`}
              >
                ⭐ Favoris
              </button>
              <button
                onClick={() => onTabChange('recent')}
                className={`tab-button px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'recent' ? 'active' : ''}`}
              >
                🕒 Récents
              </button>
            </div>
          </div>
          
          <div id="tab-content">
            {children}
          </div>
        </div>
        
        <DashboardActivity
          favorites={favorites}
          recent={recent}
          loading={loading}
        />
      </main>
    </div>
  );
};

export default DashboardLayout;