import React from 'react';
import { Compass } from 'lucide-react';
import './ui.css';

export default function EmptyState({ 
  title = 'No Items Found', 
  description = 'There are no records to display at the moment.',
  action,
  icon: Icon = Compass
}) {
  return (
    <div className="gt-empty-state">
      <div className="gt-empty-icon-box">
        <Icon size={32} />
      </div>
      <h3 className="gt-empty-title">{title}</h3>
      <p className="gt-empty-desc">{description}</p>
      {action && <div className="gt-empty-action">{action}</div>}
    </div>
  );
}
