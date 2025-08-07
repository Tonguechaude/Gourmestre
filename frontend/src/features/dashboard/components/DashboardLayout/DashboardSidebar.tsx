import React from 'react';

interface Stats {
  total_restaurants: number;
  total_favorites: number;
  average_rating: string;
}

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  stats: Stats;
  wishlistCount: number;
  isMobile?: boolean;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  stats,
  wishlistCount,
  isMobile = false,
}) => {
  return (
    <nav className={`${isMobile ? 'w-full' : 'w-72 flex-shrink-0'} bg-white ${!isMobile ? 'border-r' : ''} flex flex-col`} style={{ borderColor: 'var(--border-subtle)' }}>
      {/* Logo & Titre - Only show on desktop */}
      {!isMobile && (
        <div className="p-8 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h1 className="text-display">Gourmestre</h1>
          <p className="text-body-sm mt-2">Votre carnet gastronomique</p>
        </div>
      )}
      
      {/* Menu Navigation */}
      <div className={`flex-1 ${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
        {/* Navigation principale */}
        <div>
          <h3 className="text-caption mb-4" style={{ color: 'rgb(var(--color-muted))', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Navigation
          </h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => onTabChange('dashboard')}
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
                onClick={() => onTabChange('wishlist')}
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
      <div className={`${isMobile ? 'p-4' : 'p-6'} border-t`} style={{ borderColor: 'var(--border-subtle)' }}>
        <button 
          onClick={onLogout}
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
  );
};

export default DashboardSidebar;