import React from 'react';
import { 
  Bot, 
  Store,
  Sun,
  Moon,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

interface HeaderProps {
  activeOutlet: string;
  setActiveOutlet: (outlet: string) => void;
  theme: 'dark' | 'light' | 'soft';
  setTheme: (t: 'dark' | 'light' | 'soft') => void;
  isAdminPage?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeOutlet,
  setActiveOutlet,
  theme,
  setTheme,
  isAdminPage = false
}) => {
  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('soft');
    else setTheme('dark');
  };

  const handleExitAdmin = () => {
    window.location.hash = '#/';
    window.location.pathname = '/';
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand & Logo */}
        <div className="brand-section">
          <div className="brand-logo" style={isAdminPage ? { background: 'linear-gradient(135deg, #EC4899, #DB2777)' } : undefined}>
            {isAdminPage ? <ShieldCheck className="logo-icon" /> : <Bot className="logo-icon" />}
          </div>
          <div className="brand-text">
            <div className="brand-title">
              <span>FoodChow</span> {isAdminPage ? 'Admin Console' : 'AI Support Agent'}
            </div>
            <div className="brand-badge">
              <span className="pulse-dot" style={isAdminPage ? { backgroundColor: '#EC4899', boxShadow: '0 0 6px #EC4899' } : undefined}></span>
              {isAdminPage ? 'Protected Management Portal (/admin)' : 'Agentic Orchestrator v2.4'}
            </div>
          </div>
        </div>

        {/* Header Controls: Outlet Selector, Exit Admin & Theme Switcher */}
        <div className="header-controls">
          {isAdminPage && (
            <button 
              className="header-btn exit-admin-btn" 
              onClick={handleExitAdmin}
              title="Return to Public Customer Support Chat"
              style={{ borderColor: 'rgba(236, 72, 153, 0.4)', color: '#EC4899' }}
            >
              <ArrowLeft className="btn-icon" />
              <span>Exit Admin to Customer Chat</span>
            </button>
          )}

          <div className="outlet-selector">
            <Store className="selector-icon" />
            <select 
              value={activeOutlet} 
              onChange={(e) => setActiveOutlet(e.target.value)}
              className="outlet-dropdown"
            >
              <option value="OUTLET-12">Central Flagship Outlet #12 (Indiranagar, Metro)</option>
              <option value="OUTLET-15">Express Outlet #15 (Koramangala - POS Offline)</option>
            </select>
          </div>

          <button 
            className="header-btn" 
            onClick={toggleTheme} 
            title={`Current Theme: ${theme.toUpperCase()}. Click to change theme.`}
          >
            {theme === 'dark' ? <Moon className="btn-icon moon" /> : <Sun className="btn-icon sun" />}
            <span className="theme-text">{theme === 'dark' ? 'Midnight' : theme === 'light' ? 'Light' : 'Slate'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
