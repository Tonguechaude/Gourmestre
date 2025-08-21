import React, { useState, useCallback, useEffect, useRef } from "react";
import { autocompleteApi, type AutocompleteSuggestion } from "../api/client";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onCityChange?: (city: string) => void;
  placeholder: string;
  label: string;
  className?: string;
  type: "restaurants" | "wishlist";
  required?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onCityChange,
  placeholder,
  label,
  className = "form-input",
  type,
  required = false,
}) => {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const timeoutRef = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(
    async (searchTerm: string) => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response =
          type === "restaurants"
            ? await autocompleteApi.searchRestaurants(searchTerm)
            : await autocompleteApi.searchWishlist(searchTerm);

        setSuggestions(response.suggestions);
        setShowSuggestions(response.suggestions.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    },
    [type],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced search
    timeoutRef.current = window.setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    onChange(suggestion.name);
    if (onCityChange) {
      onCityChange(suggestion.city);
    }
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={className}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      <label className="form-label">{label}</label>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div ref={suggestionsRef} className="autocomplete-results">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.name}-${suggestion.city}-${index}`}
              className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-colors ${
                index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
              style={{
                backgroundColor:
                  index === selectedIndex
                    ? "rgba(var(--color-accent), 0.1)"
                    : "transparent",
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span
                className="font-medium text-gray-900"
                style={{ color: "rgb(var(--color-primary))" }}
              >
                {suggestion.name}
              </span>
              <span
                className="text-sm text-gray-500"
                style={{ color: "rgb(var(--color-secondary))" }}
              >
                {suggestion.city}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
