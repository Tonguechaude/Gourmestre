import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardActivity from './DashboardActivity';
import { useResponsive, MobileMenu } from '../../../../shared';

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
  const { isMobile, isTablet } = useResponsive();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    // Close mobile menu when changing tabs
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'rgb(var(--color-background))', fontFamily: 'var(--font-primary)' }}>
      {/* Mobile Header */}
      {isMobile && (
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-lg font-semibold">Gourmestre</h1>
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            <DashboardSidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onLogout={onLogout}
              stats={stats}
              wishlistCount={wishlistCount}
              isMobile={true}
            />
          </MobileMenu>
        </header>
      )}

      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} min-h-screen`}>
        {/* Desktop/Tablet Sidebar */}
        {!isMobile && (
          <DashboardSidebar
            activeTab={activeTab}
            onTabChange={onTabChange}
            onLogout={onLogout}
            stats={stats}
            wishlistCount={wishlistCount}
            isMobile={false}
          />
        )}
        
        {/* Main Content */}
        <main className={`flex-1 flex ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <div className={`flex-1 ${isMobile ? 'p-4' : 'p-8'} ${!isMobile && !isTablet ? 'max-w-4xl' : ''}`}>
            {/* Welcome Header - Hide on mobile to save space */}
            {!isMobile && (
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
            )}
            
            {/* Tabs Navigation */}
            <div className="mb-6">
              <div className={`${isMobile ? 'flex flex-wrap gap-1 p-1' : 'flex gap-2 p-1'} bg-gray-50 rounded-lg`} style={{ background: 'rgba(var(--color-border), 0.3)', width: 'fit-content' }}>
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`tab-button ${isMobile ? 'px-3 py-2 text-xs' : 'px-6 py-2.5 text-sm'} font-medium rounded-md transition-all ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                  📊 {isMobile ? 'Board' : 'Tableau de bord'}
                </button>
                <button
                  onClick={() => handleTabChange('favorites')}
                  className={`tab-button ${isMobile ? 'px-3 py-2 text-xs' : 'px-6 py-2.5 text-sm'} font-medium rounded-md transition-all ${activeTab === 'favorites' ? 'active' : ''}`}
                >
                  ⭐ Favoris
                </button>
                <button
                  onClick={() => handleTabChange('recent')}
                  className={`tab-button ${isMobile ? 'px-3 py-2 text-xs' : 'px-6 py-2.5 text-sm'} font-medium rounded-md transition-all ${activeTab === 'recent' ? 'active' : ''}`}
                >
                  🕒 Récents
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div id="tab-content">
              {children}
            </div>
          </div>
          
          {/* Activity Sidebar - Hide on mobile and tablet */}
          {!isMobile && !isTablet && (
            <DashboardActivity
              favorites={favorites}
              recent={recent}
              loading={loading}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;