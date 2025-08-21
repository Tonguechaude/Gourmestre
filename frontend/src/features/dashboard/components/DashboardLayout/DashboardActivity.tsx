import React from "react";

interface Restaurant {
  id: number;
  name: string;
  city: string;
  rating: number;
}

interface DashboardActivityProps {
  favorites: Restaurant[];
  recent: Restaurant[];
  loading: boolean;
}

const DashboardActivity: React.FC<DashboardActivityProps> = ({
  favorites,
  recent,
  loading,
}) => {
  const renderStars = (rating: number) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`star ${star <= rating ? "active" : ""}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ cursor: "default" }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <aside
      className="w-80 flex-shrink-0 p-8 border-l"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      {/* Dernier Favori */}
      <section className="mb-8">
        <div className="card-minimal" style={{ padding: "var(--space-lg)" }}>
          <header className="mb-4">
            <h3 className="text-heading-3 flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ color: "rgb(var(--color-accent))" }}
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              Dernier favori
            </h3>
          </header>

          <div className="animate-fade-in">
            {loading ? (
              <>
                <div
                  className="skeleton"
                  style={{ height: "1.5rem", marginBottom: "0.5rem" }}
                ></div>
                <div
                  className="skeleton"
                  style={{ height: "1rem", width: "70%", marginBottom: "1rem" }}
                ></div>
                <div className="skeleton" style={{ height: "3rem" }}></div>
              </>
            ) : favorites.length > 0 ? (
              <div>
                <h4 className="text-body font-semibold mb-1">
                  {favorites[0].name}
                </h4>
                <p className="text-body-sm mb-2">{favorites[0].city}</p>
                {renderStars(favorites[0].rating)}
              </div>
            ) : (
              <p
                className="text-body-sm"
                style={{ color: "rgb(var(--color-muted))" }}
              >
                Aucun favori pour le moment
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Ajouts Récents */}
      <section>
        <div className="card-minimal" style={{ padding: "var(--space-lg)" }}>
          <header className="mb-4">
            <h3 className="text-heading-3 flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ color: "rgb(var(--color-accent))" }}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              Ajouts récents
            </h3>
          </header>

          <div className="animate-fade-in">
            {loading ? (
              <div className="space-y-3">
                <div className="skeleton" style={{ height: "2.5rem" }}></div>
                <div className="skeleton" style={{ height: "2.5rem" }}></div>
                <div className="skeleton" style={{ height: "2.5rem" }}></div>
              </div>
            ) : recent.slice(0, 5).length > 0 ? (
              <div className="space-y-3">
                {recent.slice(0, 5).map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-body-sm font-medium">
                        {restaurant.name}
                      </p>
                      <p className="text-caption">{restaurant.city}</p>
                    </div>
                    {renderStars(restaurant.rating)}
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-body-sm"
                style={{ color: "rgb(var(--color-muted))" }}
              >
                Aucun restaurant pour le moment
              </p>
            )}
          </div>
        </div>
      </section>
    </aside>
  );
};

export default DashboardActivity;
