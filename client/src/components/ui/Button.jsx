import React from 'react';
import './ui.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  isLoading = false, 
  disabled = false,
  onClick, 
  type = 'button',
  className = ''
}) {
  return (
    <button
      type={type}
      className={`gt-btn gt-btn-${variant} gt-btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="gt-btn-spinner"></span>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="gt-btn-icon" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
