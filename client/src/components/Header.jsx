import React, { useEffect } from 'react';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import './Header.css';

export default function Header({ theme, setTheme, onSearchClick }) {

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onSearchClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchClick]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="top-header">
      <div className="header-left-space">
        <div 
          className="search-bar-container" 
          onClick={onSearchClick}
          title="Search trips, cities & activities (Ctrl+K)"
        >
          <Search size={16} className="search-icon" />
          <span className="search-placeholder-text">Search trips, cities, activities...</span>
          <kbd className="cmd-k-badge">⌘K</kbd>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="action-icon-btn" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="action-icon-btn notification-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  );
}
