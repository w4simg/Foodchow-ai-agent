import React from 'react';
import { 
  Bot, 
  Headphones, 
  Database, 
  Zap, 
  Sparkles,
  Store,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'dashboard' | 'rag' | 'scenarios' | 'admin';
  setActiveTab: (tab: 'chat' | 'dashboard' | 'rag' | 'scenarios' | 'admin') => void;
  openTicketsCount: number;
  activeOutlet: string;
  setActiveOutlet: (outlet: string) => void;
  theme: 'dark' | 'light' | 'soft';
  setTheme: (t: 'dark' | 'light' | 'soft') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openTicketsCount,
  activeOutlet,
  setActiveOutlet,
  theme,
  setTheme
}) => {
  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('soft');
    else setTheme('dark');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand & Logo */}
        <div className="brand-section">
          <div className="brand-logo">
            <Bot className="logo-icon" />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              <span>FoodChow</span> AI Support Agent
            </div>
            <div className="brand-badge">
              <span className="pulse-dot"></span>
              Agentic Orchestrator v2.4
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Clean Public Navigation Only */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <Sparkles className="tab-icon" />
            <span>Customer Chat</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Headphones className="tab-icon" />
            <span>Human Handoff</span>
            {openTicketsCount > 0 && (
              <span className="badge-count">{openTicketsCount}</span>
            )}
          </button>

          <button
            className={`nav-tab ${activeTab === 'scenarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('scenarios')}
          >
            <Zap className="tab-icon" />
            <span>Eval Scenarios</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'rag' ? 'active' : ''}`}
            onClick={() => setActiveTab('rag')}
          >
            <Database className="tab-icon" />
            <span>RAG Knowledge</span>
          </button>
        </nav>

        {/* Header Controls: Outlet Selector & Theme Switcher ONLY */}
        <div className="header-controls">
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
