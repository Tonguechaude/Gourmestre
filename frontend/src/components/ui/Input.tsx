import React from "react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, type = "text", id, ...props },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasValue =
      props.value !== undefined ? String(props.value).length > 0 : false;

    return (
      <div className="relative">
        <input
          type={type}
          id={inputId}
          ref={ref}
          className={cn(
            "peer w-full rounded-md border border-gray-200 bg-surface px-3 py-4 text-base text-primary placeholder-transparent transition-all",
            "focus:border-accent/30 focus:shadow-focus focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus:border-error",
            label && "pt-6 pb-2",
            className,
          )}
          placeholder={label || props.placeholder}
          {...props}
        />

        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 top-4 text-base text-muted transition-all duration-200 pointer-events-none",
              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent",
              "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted",
              hasValue && "top-2 text-xs text-accent",
            )}
          >
            {label}
          </label>
        )}

        {(error || helperText) && (
          <div className="mt-1 text-sm">
            {error && (
              <p className="text-error flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-secondary">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

// Textarea component
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasValue =
      props.value !== undefined ? String(props.value).length > 0 : false;

    return (
      <div className="relative">
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "peer w-full rounded-md border border-gray-200 bg-surface px-3 py-4 text-base text-primary placeholder-transparent transition-all resize-vertical min-h-[5rem]",
            "focus:border-accent/30 focus:shadow-focus focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus:border-error",
            label && "pt-6 pb-2",
            className,
          )}
          placeholder={label || props.placeholder}
          {...props}
        />

        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 top-4 text-base text-muted transition-all duration-200 pointer-events-none",
              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent",
              "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted",
              hasValue && "top-2 text-xs text-accent",
            )}
          >
            {label}
          </label>
        )}

        {(error || helperText) && (
          <div className="mt-1 text-sm">
            {error && (
              <p className="text-error flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-secondary">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
export type { InputProps, TextareaProps };
