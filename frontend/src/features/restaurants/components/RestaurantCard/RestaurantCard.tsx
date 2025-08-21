import React, { memo, useMemo, useCallback } from "react";
import { useResponsive } from "../../../../shared";

interface Restaurant {
  id: number;
  name: string;
  city: string;
  description?: string;
  rating: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onEdit?: (restaurant: Restaurant) => void;
  onDelete?: (id: number) => void;
  className?: string;
  showActions?: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = memo(
  ({ restaurant, onEdit, onDelete, className = "", showActions = false }) => {
    const { isMobile } = useResponsive();

    // Memorize star rendering to avoid re-computation
    const stars = useMemo(
      () => (
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`star ${star <= restaurant.rating ? "active" : ""}`}
              data-rating={star}
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ cursor: "default" }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      ),
      [restaurant.rating],
    );

    const formattedDate = useMemo(
      () => new Date(restaurant.created_at).toLocaleDateString("fr-FR"),
      [restaurant.created_at],
    );

    const handleEdit = useCallback(() => {
      onEdit?.(restaurant);
    }, [onEdit, restaurant]);

    const handleDelete = useCallback(() => {
      if (
        window.confirm(
          `Êtes-vous sûr de vouloir supprimer "${restaurant.name}" ?`,
        )
      ) {
        onDelete?.(restaurant.id);
      }
    }, [onDelete, restaurant.id, restaurant.name]);

    return (
      <div
        className={`card ${className}`}
        style={{ padding: isMobile ? "var(--space-md)" : "var(--space-lg)" }}
      >
        <div
          className={`flex ${isMobile ? "flex-col" : "items-start justify-between"} ${isMobile ? "gap-3" : "mb-3"}`}
        >
          <div className="flex-1">
            <h3
              className={`${isMobile ? "text-body" : "text-heading-3"} mb-1 font-semibold`}
            >
              {restaurant.name}
            </h3>
            <p className={`${isMobile ? "text-body-sm" : "text-body-sm"}`}>
              {restaurant.city}
            </p>
          </div>

          <div
            className={`flex items-center ${isMobile ? "justify-between" : "gap-2"}`}
          >
            <div className="flex items-center gap-2">
              {stars}
              {restaurant.is_favorite && (
                <svg
                  width={isMobile ? "16" : "18"}
                  height={isMobile ? "16" : "18"}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ color: "rgb(var(--color-accent))" }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </div>

            {/* Actions optionnelles */}
            {showActions && (
              <div
                className={`flex items-center gap-1 ${!isMobile ? "ml-2" : ""}`}
              >
                <button
                  onClick={handleEdit}
                  className="btn btn-ghost text-sm p-1"
                  title="Modifier"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-ghost text-sm p-1"
                  style={{ color: "#ef4444" }}
                  title="Supprimer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {restaurant.description && (
          <p
            className={`text-body-sm ${isMobile ? "mt-2" : "mt-0"}`}
            style={{ color: "rgb(var(--color-secondary))" }}
          >
            {restaurant.description}
          </p>
        )}

        <div
          className={`flex items-center justify-between ${isMobile ? "mt-2 pt-2" : "mt-3 pt-3"} border-t border-gray-100`}
        >
          <span
            className="text-caption"
            style={{ color: "rgb(var(--color-muted))" }}
          >
            Ajouté le {formattedDate}
          </span>
        </div>
      </div>
    );
  },
);

RestaurantCard.displayName = "RestaurantCard";

export default RestaurantCard;
