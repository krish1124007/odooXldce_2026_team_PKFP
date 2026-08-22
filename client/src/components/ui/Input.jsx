import React from 'react';
import './ui.css';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  required = false,
  className = '',
  name
}) {
  return (
    <div className={`gt-input-group ${className}`}>
      {label && (
        <label className="gt-input-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="gt-input-wrapper">
        {Icon && <Icon size={18} className="gt-input-icon" />}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`gt-input ${Icon ? 'has-icon' : ''} ${error ? 'is-invalid' : ''}`}
        />
      </div>
      {error && <span className="gt-input-error">{error}</span>}
    </div>
  );
}
