import React from 'react';
import './ui.css';

export default function Card({ children, title, subtitle, className = '', headerAction }) {
  return (
    <div className={`gt-card ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="gt-card-header">
          <div>
            {title && <h3 className="gt-card-title">{title}</h3>}
            {subtitle && <p className="gt-card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="gt-card-action">{headerAction}</div>}
        </div>
      )}
      <div className="gt-card-body">{children}</div>
    </div>
  );
}
