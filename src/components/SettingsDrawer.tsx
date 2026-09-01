import React, { useState } from 'react';
import { DatabaseAdapter, DatabaseConfig } from '../db/databaseAdapter';
import { 
  Settings, 
  Database, 
  Key, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  X, 
  Store, 
  Cpu, 
  Sparkles,
  Server
} from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light' | 'soft';
  setTheme: (t: 'dark' | 'light' | 'soft') => void;
  activeOutlet: string;
  setActiveOutlet: (o: string) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  activeOutlet,
  setActiveOutlet
}) => {
  const [dbType, setDbType] = useState<'MOCK' | 'POSTGRESQL' | 'SUPABASE' | 'MONGODB'>('MOCK');
  const [connString, setConnString] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [llmProvider, setLlmProvider] = useState<'LOCAL' | 'OPENAI' | 'GEMINI'>('LOCAL');
  const [llmKey, setLlmKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSaveDb = () => {
    DatabaseAdapter.setConfig({
      type: dbType,
      connectionString: connString,
      apiKey: apiKey
    });
    alert(`Database config updated to ${dbType}! Ready for real data connection.`);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(DatabaseAdapter.getSQLSchema());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="modal-header">
          <div className="header-title">
            <Settings className="modal-icon" />
            <h3>System Settings & Database Integration</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X className="close-icon" />
          </button>
        </div>

        <div className="modal-body">
          {/* Theme Selector */}
          <div className="setting-card">
            <h4>
              <Sun className="card-icon" />
              Appearance & Theme Style
            </h4>
            <p className="setting-desc">Switch between clean light mode, soft SaaS theme, and dark mode.</p>

            <div className="theme-options">
              <button
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun className="btn-icon" />
                <span>Clean Light</span>
              </button>

              <button
                className={`theme-btn ${theme === 'soft' ? 'active' : ''}`}
                onClick={() => setTheme('soft')}
              >
                <Sparkles className="btn-icon" />
                <span>Soft Slate SaaS</span>
              </button>

              <button
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="btn-icon" />
                <span>Midnight Dark</span>
              </button>
            </div>
          </div>

          {/* Real Database Connection */}
          <div className="setting-card">
            <h4>
              <Database className="card-icon" />
              Real Database Integration (PostgreSQL / Supabase / MongoDB)
            </h4>
            <p className="setting-desc">Connect your real production database or view auto-generated SQL schemas.</p>

            <div className="input-field">
              <label>Database Type:</label>
              <select 
                value={dbType} 
                onChange={(e) => setDbType(e.target.value as any)}
                className="select-box"
              >
                <option value="MOCK">Mock In-Memory Store (Default)</option>
                <option value="POSTGRESQL">PostgreSQL Database</option>
                <option value="SUPABASE">Supabase Cloud Database</option>
                <option value="MONGODB">MongoDB Atlas</option>
              </select>
            </div>

            {dbType !== 'MOCK' && (
              <>
                <div className="input-field">
                  <label>Connection String / URL:</label>
                  <input
                    type="text"
                    placeholder="postgresql://user:password@localhost:5432/foodchow"
                    value={connString}
                    onChange={(e) => setConnString(e.target.value)}
                    className="text-input"
                  />
                </div>

                <div className="input-field">
                  <label>API Key / Token (Optional):</label>
                  <input
                    type="password"
                    placeholder="sbp_123456789..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="text-input"
                  />
                </div>

                <button className="btn-primary" onClick={handleSaveDb}>
                  <Server className="btn-icon" />
                  Save Database Connection
                </button>
              </>
            )}

            <div className="sql-schema-box">
              <div className="schema-top">
                <span>SQL Table Migration Schema</span>
                <button className="btn-copy-sql" onClick={handleCopySql}>
                  {copiedSql ? <Check className="btn-icon" /> : <Copy className="btn-icon" />}
                  {copiedSql ? 'Copied!' : 'Copy SQL Schema'}
                </button>
              </div>
              <pre className="sql-code">{DatabaseAdapter.getSQLSchema()}</pre>
            </div>
          </div>

          {/* LLM Key Integration */}
          <div className="setting-card">
            <h4>
              <Cpu className="card-icon" />
              Live LLM Provider API Integration
            </h4>
            <p className="setting-desc">Plug in custom OpenAI GPT-4o or Google Gemini API keys for live model responses.</p>

            <div className="input-field">
              <label>LLM Engine:</label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value as any)}
                className="select-box"
              >
                <option value="LOCAL">FoodChow High-Speed Agent Engine (Built-in)</option>
                <option value="OPENAI">OpenAI GPT-4o API</option>
                <option value="GEMINI">Google Gemini 1.5 Pro API</option>
              </select>
            </div>

            {llmProvider !== 'LOCAL' && (
              <div className="input-field">
                <label>API Key:</label>
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={llmKey}
                  onChange={(e) => setLlmKey(e.target.value)}
                  className="text-input"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
