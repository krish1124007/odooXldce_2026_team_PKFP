import React from 'react';
import { X } from 'lucide-react';
import './ui.css';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="gt-modal-overlay" onClick={onClose}>
      <div className="gt-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="gt-modal-header">
          <h2 className="gt-modal-title">{title}</h2>
          <button className="gt-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="gt-modal-body">{children}</div>
      </div>
    </div>
  );
}
