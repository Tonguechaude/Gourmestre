import React, { memo } from 'react';

interface FormErrorProps {
  error?: string;
  className?: string;
}

const FormError: React.FC<FormErrorProps> = memo(({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`form-error ${className}`} style={{ 
      color: '#ef4444', 
      fontSize: '0.875rem', 
      marginTop: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      {error}
    </div>
  );
});

FormError.displayName = 'FormError';

export default FormError;