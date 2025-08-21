import React from "react";
import { useWishlistFormRHF } from "../../hooks/useWishlistFormRHF";
import { FormError } from "../../../../shared/components";
import { priorityOptions } from "../../../../shared/validation";
import AutocompleteInput from "../../../../components/AutocompleteInput";

interface WishlistFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

const WishlistForm: React.FC<WishlistFormProps> = ({
  onSuccess,
  onError,
  className = "",
}) => {
  const {
    register,
    handleSubmit,
    errors,
    isValid,
    isDirty,
    isLoading,
    watchedName,
    setValue,
  } = useWishlistFormRHF({ onSuccess, onError });

  return (
    <div
      className={`card ${className}`}
      style={{ padding: "var(--space-2xl)" }}
    >
      <header className="mb-8">
        <h2 className="text-heading-2 mb-2 flex items-center gap-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: "rgb(var(--color-accent))" }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Ajouter à la wishlist
        </h2>
        <p className="text-body-sm">
          Ajoutez un restaurant que vous souhaitez essayer
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="Ex: Le Comptoir du Relais"
              label="Nom du restaurant"
              type="wishlist"
              required
            />
            <FormError error={errors.name?.message} />
          </div>

          <div className="form-group">
            <input
              {...register("city")}
              type="text"
              className={`form-input ${errors.city ? "error" : ""}`}
              placeholder="Ex: Paris"
            />
            <label className="form-label">Ville</label>
            <FormError error={errors.city?.message} />
          </div>
        </div>

        <div className="form-group">
          <select
            {...register("priority")}
            className={`form-select ${errors.priority ? "error" : ""}`}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="form-label">Priorité</label>
          <FormError error={errors.priority?.message} />
        </div>

        <div className="form-group">
          <textarea
            {...register("notes")}
            className={`form-input form-textarea ${errors.notes ? "error" : ""}`}
            rows={3}
            placeholder="Pourquoi voulez-vous essayer ce restaurant ?"
          />
          <label className="form-label">Notes (optionnel)</label>
          <FormError error={errors.notes?.message} />
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
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z" />
            </svg>
            {isLoading ? "Ajout en cours..." : "Ajouter à la wishlist"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WishlistForm;
