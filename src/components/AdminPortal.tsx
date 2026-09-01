import React, { useState } from 'react';
import { DatabaseAdapter } from '../db/databaseAdapter';
import { 
  ShieldCheck, 
  Database, 
  Key, 
  Copy, 
  Check, 
  Server, 
  Cpu, 
  Lock,
  Sliders,
  LogOut,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface AdminPortalProps {
  activeOutlet: string;
  setActiveOutlet: (o: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  activeOutlet,
  setActiveOutlet
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('foodchow_admin_auth') === 'true';
  });

  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Database & Settings State
  const [dbType, setDbType] = useState<'MOCK' | 'POSTGRESQL' | 'SUPABASE' | 'MONGODB'>('MOCK');
  const [connString, setConnString] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [llmProvider, setLlmProvider] = useState<'LOCAL' | 'OPENAI' | 'GEMINI'>('LOCAL');
  const [llmKey, setLlmKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [refundThreshold, setRefundThreshold] = useState<number>(500);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId.trim() === 'admin' && (adminPassword === 'admin123' || adminPassword === 'foodchow123')) {
      setIsAuthenticated(true);
      sessionStorage.setItem('foodchow_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid Admin ID or Password. (Hint: ID: admin, Pass: admin123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('foodchow_admin_auth');
  };

  const handleSaveDb = () => {
    DatabaseAdapter.setConfig({
      type: dbType,
      connectionString: connString,
      apiKey: apiKey
    });
    alert(`[Admin Config Saved] Database integration updated to ${dbType}! Ready for live calls.`);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(DatabaseAdapter.getSQLSchema());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // RENDER ADMIN LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="login-header">
            <div className="lock-icon-bg">
              <Lock className="lock-icon" />
            </div>
            <h2>Admin Portal Authentication</h2>
            <p>Protected System Access. Enter Admin ID & Password to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {loginError && (
              <div className="login-error-banner">
                <AlertCircle className="error-icon" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="form-group">
              <label>Admin ID:</label>
              <input
                type="text"
                className="admin-input"
                placeholder="Enter Admin ID (Default: admin)"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                className="admin-input"
                placeholder="Enter Password (Default: admin123)"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-admin-login">
              <UserCheck className="btn-icon" />
              Unlock Admin Console
            </button>
          </form>

          <div className="credentials-hint">
            <span>🔐 Admin Credentials Hint:</span>
            <code>ID: admin | Password: admin123</code>
          </div>
        </div>
      </div>
    );
  }

  // RENDER AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="admin-portal-layout">
      {/* Admin Header Banner */}
      <div className="admin-banner">
        <div className="banner-left">
          <ShieldCheck className="admin-icon" />
          <div>
            <h2>FoodChow Admin Console (/admin)</h2>
            <p>Protected Administrator Management Suite. Configure Real Database Connectors & LLM Keys.</p>
          </div>
        </div>

        <div className="banner-right">
          <div className="admin-status-badge">
            <UserCheck className="badge-icon" />
            <span>Logged in as Admin</span>
          </div>

          <button className="btn-admin-logout" onClick={handleLogout} title="Logout Admin Session">
            <LogOut className="btn-icon" />
            <span>Logout Session</span>
          </button>
        </div>
      </div>

      <div className="admin-grid">
        {/* Real Database Configuration */}
        <div className="admin-card">
          <div className="card-title-row">
            <Database className="card-icon" />
            <h3>Real Database Connector Setup</h3>
          </div>
          <p className="card-sub">Connect your real PostgreSQL, Supabase, or MongoDB instance to replace mock datasets.</p>

          <div className="form-group">
            <label>Database Engine Provider:</label>
            <select 
              value={dbType} 
              onChange={(e) => setDbType(e.target.value as any)}
              className="admin-select"
            >
              <option value="MOCK">Mock In-Memory Telemetry Engine (Default)</option>
              <option value="POSTGRESQL">PostgreSQL Database</option>
              <option value="SUPABASE">Supabase Cloud SQL</option>
              <option value="MONGODB">MongoDB Atlas Cluster</option>
            </select>
          </div>

          {dbType !== 'MOCK' && (
            <>
              <div className="form-group">
                <label>Connection URI String:</label>
                <input
                  type="text"
                  placeholder="postgresql://admin:secret@localhost:5432/foodchow"
                  value={connString}
                  onChange={(e) => setConnString(e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="form-group">
                <label>API Key / Auth Token (Optional):</label>
                <input
                  type="password"
                  placeholder="sbp_123456789..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="admin-input"
                />
              </div>

              <button className="btn-admin-save" onClick={handleSaveDb}>
                <Server className="btn-icon" />
                Save Database Connector
              </button>
            </>
          )}

          <div className="sql-box">
            <div className="sql-header">
              <span>SQL Table Migration DDL Schema</span>
              <button className="btn-copy" onClick={handleCopySql}>
                {copiedSql ? <Check className="btn-icon" /> : <Copy className="btn-icon" />}
                {copiedSql ? 'Copied!' : 'Copy SQL Schema'}
              </button>
            </div>
            <pre className="sql-code">{DatabaseAdapter.getSQLSchema()}</pre>
          </div>
        </div>

        {/* LLM & Guardrail Controls */}
        <div className="admin-card">
          <div className="card-title-row">
            <Cpu className="card-icon" />
            <h3>LLM Engine & Policy Guardrails</h3>
          </div>
          <p className="card-sub">Plug in custom OpenAI/Gemini API keys and configure automated guardrail limits.</p>

          <div className="form-group">
            <label>LLM Engine Provider:</label>
            <select
              value={llmProvider}
              onChange={(e) => setLlmProvider(e.target.value as any)}
              className="admin-select"
            >
              <option value="LOCAL">FoodChow Local Autonomous Agent Engine (High Speed)</option>
              <option value="OPENAI">OpenAI GPT-4o API</option>
              <option value="GEMINI">Google Gemini 1.5 Pro API</option>
            </select>
          </div>

          {llmProvider !== 'LOCAL' && (
            <div className="form-group">
              <label>API Secret Key:</label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={llmKey}
                onChange={(e) => setLlmKey(e.target.value)}
                className="admin-input"
              />
            </div>
          )}

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sliders className="label-icon" />
              Automated AI Refund Approval Limit (₹):
            </label>
            <input
              type="number"
              value={refundThreshold}
              onChange={(e) => setRefundThreshold(Number(e.target.value))}
              className="admin-input"
            />
            <span className="field-note">Refund requests exceeding ₹{refundThreshold} automatically require Human Support Manager approval.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
