import React from 'react';
import './ui.css';

export default function Loading({ text = 'Loading GlobeTrotter...', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="gt-loading-full">
        <div className="gt-spinner-lg"></div>
        <p className="gt-loading-text">{text}</p>
      </div>
    );
  }

  return (
    <div className="gt-loading-inline">
      <div className="gt-spinner-md"></div>
      <span className="gt-loading-text">{text}</span>
    </div>
  );
}
