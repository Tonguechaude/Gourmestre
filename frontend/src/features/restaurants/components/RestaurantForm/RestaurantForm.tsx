import React from "react";
import { useRestaurantFormRHF } from "../../hooks/useRestaurantFormRHF";
import { FormError } from "../../../../shared/components";
import { useResponsive } from "../../../../shared";
import AutocompleteInput from "../../../../components/AutocompleteInput";

interface RestaurantFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({
  onSuccess,
  onError,
  className = "",
}) => {
  const { isMobile } = useResponsive();
  const {
    register,
    handleSubmit,
    errors,
    isValid,
    isDirty,
    isLoading,
    handleStarClick,
    watchedRating,
    watchedName,
    setValue,
  } = useRestaurantFormRHF({ onSuccess, onError });

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`star ${star <= rating ? "active" : ""}`}
            data-rating={star}
            fill="currentColor"
            viewBox="0 0 24 24"
            onClick={interactive ? () => handleStarClick(star) : undefined}
            style={{ cursor: interactive ? "pointer" : "default" }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`card ${className}`}
      style={{ padding: isMobile ? "var(--space-lg)" : "var(--space-2xl)" }}
    >
      <header className={isMobile ? "mb-4" : "mb-8"}>
        <h2
          className={`${isMobile ? "text-heading-3" : "text-heading-2"} mb-2`}
        >
          Ajouter un restaurant
        </h2>
        <p className="text-body-sm">
          Enrichissez votre collection gastronomique
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className={isMobile ? "space-y-4" : "space-y-6"}
      >
        <div
          className={`grid grid-cols-1 ${isMobile ? "gap-4" : "md:grid-cols-2 gap-6"}`}
        >
          <div className="form-group">
            <AutocompleteInput
              value={watchedName}
              onChange={(value) =>
                setValue("name", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              onCityChange={(city) =>
                setValue("city", city, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              placeholder="Nom du restaurant"
              label="Nom du restaurant"
              type="restaurants"
              required
            />
            <FormError error={errors.name?.message} />
          </div>

          <div className="form-group">
            <input
              {...register("city")}
              type="text"
              className={`form-input ${errors.city ? "error" : ""}`}
              placeholder="Ville"
            />
            <label className="form-label">Ville</label>
            <FormError error={errors.city?.message} />
          </div>
        </div>

        <div className="form-group">
          <textarea
            {...register("description")}
            className={`form-input form-textarea ${errors.description ? "error" : ""}`}
            placeholder="Votre avis, vos impressions..."
            rows={4}
          />
          <label className="form-label">Description</label>
          <FormError error={errors.description?.message} />
        </div>

        {/* Notation et Favoris */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Système d'étoiles */}
          <div className="form-group mb-0">
            <label className="text-caption mb-3 block">Votre note</label>
            {renderStars(watchedRating, true)}
            <input type="hidden" {...register("rating")} />
            <FormError error={errors.rating?.message} />
          </div>

          <div className="form-group mb-0">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register("is_favorite")}
                type="checkbox"
                className="form-checkbox"
              />
              <span className="text-body">Ajouter aux favoris</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ color: "rgb(var(--color-accent))" }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className={`btn btn-primary ${!isValid || !isDirty ? "disabled" : ""}`}
            disabled={isLoading || !isValid || !isDirty}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            {isLoading ? "Ajout en cours..." : "Ajouter ce restaurant"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantForm;
