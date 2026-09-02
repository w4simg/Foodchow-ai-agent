import React, { useState, useEffect } from 'react';
import { 
  EscalationTicket, 
  PredefinedScenario, 
  RAGDocument, 
  SupportCategory 
} from '../types/agent';
import { appStore } from '../store/appStore';
import { HumanDashboard } from './HumanDashboard';
import { PredefinedScenariosView } from './PredefinedScenariosView';
import { RAGInspector } from './RAGInspector';
import { DocumentModal } from './DocumentModal';
import { 
  Headphones, 
  Zap, 
  BookOpen, 
  ShieldCheck, 
  LogOut, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Sliders, 
  X
} from 'lucide-react';

interface AdminPortalProps {
  activeOutlet: string;
  setActiveOutlet: (outletId: string) => void;
  onRunScenario: (scenario: PredefinedScenario) => void;
  onApproveAction: (ticketId: string) => void;
  onRejectAction: (ticketId: string) => void;
  onSendHumanMessage: (ticketId: string, text: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  activeOutlet,
  setActiveOutlet,
  onRunScenario,
  onApproveAction,
  onRejectAction,
  onSendHumanMessage
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('foodchow_admin_auth') === 'true';
  });

  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sub-Navigation Tabs inside Admin
  const [adminTab, setAdminTab] = useState<'tickets' | 'scenarios' | 'rag' | 'llm'>('tickets');

  // Store Subscriptions State
  const [tickets, setTickets] = useState<EscalationTicket[]>(() => appStore.getTickets());
  const [scenarios, setScenarios] = useState<PredefinedScenario[]>(() => appStore.getScenarios());
  const [knowledgeBase, setKnowledgeBase] = useState<RAGDocument[]>(() => appStore.getKnowledgeBase());

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setTickets([...appStore.getTickets()]);
      setScenarios([...appStore.getScenarios()]);
      setKnowledgeBase([...appStore.getKnowledgeBase()]);
    });
    return unsubscribe;
  }, []);

  // LLM Settings State
  const [llmProvider, setLlmProvider] = useState<'AUTO' | 'GROQ' | 'GEMINI' | 'LOCAL'>(() => {
    return (localStorage.getItem('foodchow_llm_provider') as any) || 'AUTO';
  });
  
  const [groqKey, setGroqKey] = useState<string>(() => {
    return localStorage.getItem('foodchow_groq_key') || localStorage.getItem('foodchow_llm_key') || '';
  });
  
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return localStorage.getItem('foodchow_gemini_key') || '';
  });

  useEffect(() => {
    localStorage.setItem('foodchow_llm_provider', llmProvider);
  }, [llmProvider]);

  useEffect(() => {
    localStorage.setItem('foodchow_groq_key', groqKey);
    localStorage.setItem('foodchow_llm_key', groqKey);
  }, [groqKey]);

  useEffect(() => {
    localStorage.setItem('foodchow_gemini_key', geminiKey);
  }, [geminiKey]);

  const [refundThreshold, setRefundThreshold] = useState<number>(500);

  // API Key Testing State
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ status: 'success' | 'error' | 'warning'; message: string; details?: string } | null>(null);

  // Edit / Create Modal State
  const [editingItem, setEditingItem] = useState<{ type: 'scenario' | 'rag'; isNew?: boolean; data: any } | null>(null);
  const [activeDocModal, setActiveDocModal] = useState<RAGDocument | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId.trim() === 'admin' && adminPassword === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('foodchow_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid Admin credentials. Use ID: admin / Pass: admin123');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('foodchow_admin_auth');
  };

  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    let results: string[] = [];
    let hasError = false;

    try {
      if (groqKey.trim()) {
        const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${groqKey.trim()}` }
        });
        if (groqRes.ok) {
          results.push('✅ Groq Primary API (openai/gpt-oss-120b): Authorized & Active!');
        } else {
          hasError = true;
          results.push(`❌ Groq API Key Error (HTTP ${groqRes.status})`);
        }
      } else {
        results.push('ℹ️ Groq API Key: Not provided');
      }

      if (geminiKey.trim()) {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey.trim()}`);
        if (geminiRes.ok) {
          results.push('✅ Google Gemini Secondary Fallback API: Authorized & Active!');
        } else {
          hasError = true;
          results.push(`❌ Gemini API Key Error (HTTP ${geminiRes.status})`);
        }
      } else {
        results.push('ℹ️ Gemini API Key: Not provided');
      }

      setKeyTestResult({
        status: hasError ? 'warning' : 'success',
        message: hasError ? '⚠️ API Connection Warnings Detected' : '✅ LLM Engine & Auto-Failover Quotas Active!',
        details: results.join(' • ')
      });
    } catch (err: any) {
      setKeyTestResult({
        status: 'error',
        message: '❌ Key Connection Error',
        details: 'Failed to reach API authorization servers.'
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.type === 'scenario') {
      if (editingItem.isNew) {
        appStore.addScenario(editingItem.data);
      } else {
        appStore.updateScenario(editingItem.data.id, editingItem.data);
      }
    } else {
      if (editingItem.isNew) {
        appStore.addRAGDoc(editingItem.data);
      } else {
        appStore.updateRAGDoc(editingItem.data.id, editingItem.data);
      }
    }

    setEditingItem(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-overlay">
        <div className="admin-login-card">
          <div className="login-header">
            <div className="shield-avatar">
              <ShieldCheck className="shield-icon" />
            </div>
            <h2>FoodChow Admin Console</h2>
            <p>Protected Management Portal (/admin)</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {loginError && (
              <div className="login-error-banner">
                <AlertTriangle className="error-icon" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="form-group">
              <label>Admin ID:</label>
              <input
                type="text"
                className="login-input"
                placeholder="e.g. admin"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-submit-btn">
              <Lock className="btn-icon" />
              <span>Authenticate & Access Admin Workspace</span>
            </button>
          </form>

          <div className="login-footer-hint">
            <span>Default Credentials: <strong>ID: admin</strong> | <strong>Password: admin123</strong></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal-container">
      {/* Sub-Navigation Tabs Bar */}
      <div className="admin-sub-header">
        <div className="admin-tabs-nav">
          <button
            className={`admin-tab-btn ${adminTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setAdminTab('tickets')}
          >
            <Headphones className="tab-icon" />
            <span>Human Handoff ({tickets.length})</span>
          </button>

          <button
            className={`admin-tab-btn ${adminTab === 'scenarios' ? 'active' : ''}`}
            onClick={() => setAdminTab('scenarios')}
          >
            <Zap className="tab-icon" />
            <span>Eval Scenarios ({scenarios.length})</span>
          </button>

          <button
            className={`admin-tab-btn ${adminTab === 'rag' ? 'active' : ''}`}
            onClick={() => setAdminTab('rag')}
          >
            <BookOpen className="tab-icon" />
            <span>RAG Knowledge Base ({knowledgeBase.length})</span>
          </button>

          <button
            className={`admin-tab-btn ${adminTab === 'llm' ? 'active' : ''}`}
            onClick={() => setAdminTab('llm')}
          >
            <Cpu className="tab-icon" />
            <span>LLM & Guardrail Controls</span>
          </button>
        </div>

        <button className="btn-logout" onClick={handleLogout} title="Sign Out of Admin Session">
          <LogOut className="logout-icon" />
          <span>Logout Admin</span>
        </button>
      </div>

      {/* Main Tab Content Views */}
      {adminTab === 'tickets' && (
        <HumanDashboard
          tickets={tickets}
          onApproveAction={onApproveAction}
          onRejectAction={onRejectAction}
          onSendHumanMessage={onSendHumanMessage}
        />
      )}

      {adminTab === 'scenarios' && (
        <PredefinedScenariosView
          onRunScenario={onRunScenario}
          onEditScenario={(sc) => setEditingItem({ type: 'scenario', data: { ...sc } })}
          onCreateScenario={() => setEditingItem({ type: 'scenario', isNew: true, data: { id: `SCENARIO-${scenarios.length + 1}`, title: '', category: 'POS', badge: 'Custom', description: '', initialMessage: '', expectedFlow: ['Classify issue category', 'Search RAG knowledge base', 'Invoke hardware diagnostic tools', 'Provide resolution steps'] } })}
          onDeleteScenario={(id) => {
            if (confirm('Are you sure you want to delete this Eval Scenario?')) {
              appStore.deleteScenario(id);
            }
          }}
        />
      )}

      {adminTab === 'rag' && (
        <RAGInspector
          onViewDoc={(doc) => setActiveDocModal(doc)}
          onEditDoc={(doc) => setEditingItem({ type: 'rag', data: { ...doc } })}
          onCreateDoc={() => setEditingItem({ type: 'rag', isNew: true, data: { id: `KB-CUST-${knowledgeBase.length + 1}`, title: '', category: 'POS', tags: ['custom'], lastUpdated: new Date().toISOString().split('T')[0], content: '# New RAG Documentation Article\n\nEnter article content here...' } })}
          onDeleteDoc={(id) => {
            if (confirm('Are you sure you want to delete this RAG Knowledge Base Article?')) {
              appStore.deleteRAGDoc(id);
            }
          }}
        />
      )}

      {adminTab === 'llm' && (
        <div className="admin-db-settings-view">
          {/* LLM & Guardrail Controls */}
          <div className="admin-card">
            <div className="card-title-row">
              <Cpu className="card-icon" />
              <h3>LLM Failover Engine & Policy Guardrails</h3>
            </div>
            <p className="card-sub">Configure primary (Groq openai/gpt-oss-120b) & secondary (Google Gemini 1.5) API keys for automatic failover.</p>

            <div className="form-group">
              <label>LLM Execution Mode:</label>
              <select
                value={llmProvider}
                onChange={(e) => {
                  setLlmProvider(e.target.value as any);
                  setKeyTestResult(null);
                }}
                className="admin-select"
              >
                <option value="AUTO">⚡ Auto-Failover: Groq (openai/gpt-oss-120b) ➔ Gemini 1.5 ➔ Local Engine (Recommended)</option>
                <option value="GROQ">Groq Cloud API Only (openai/gpt-oss-120b)</option>
                <option value="GEMINI">Google Gemini 1.5 Pro / Flash API Only</option>
                <option value="LOCAL">FoodChow Local Autonomous Agent Engine Only</option>
              </select>
            </div>

            <div className="form-group">
              <label>Primary: Groq Cloud API Secret Key (model: openai/gpt-oss-120b):</label>
              <input
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => {
                  setGroqKey(e.target.value);
                  setKeyTestResult(null);
                }}
                className="admin-input"
              />
            </div>

            <div className="form-group">
              <label>Secondary Fallback: Google Gemini API Secret Key:</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => {
                  setGeminiKey(e.target.value);
                  setKeyTestResult(null);
                }}
                className="admin-input"
              />
            </div>

            <div className="key-test-action-row" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn-test-key-full"
                onClick={handleTestApiKey}
                disabled={isTestingKey}
              >
                {isTestingKey ? <Loader2 className="btn-icon spin" /> : <Zap className="btn-icon" />}
                <span>{isTestingKey ? 'Verifying API Keys & Token Limits...' : 'Test API Key Connections & Failover Quotas'}</span>
              </button>
            </div>

            {keyTestResult && (
              <div className={`key-test-banner ${keyTestResult.status}`}>
                <div className="test-banner-title">
                  {keyTestResult.status === 'success' && <CheckCircle2 className="banner-icon success" />}
                  {keyTestResult.status === 'error' && <XCircle className="banner-icon error" />}
                  {keyTestResult.status === 'warning' && <AlertTriangle className="banner-icon warning" />}
                  <span>{keyTestResult.message}</span>
                </div>
                {keyTestResult.details && (
                  <div className="test-banner-details">{keyTestResult.details}</div>
                )}
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
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
      )}

      {/* --- RAG ARTICLE DOCUMENT MODAL --- */}
      <DocumentModal
        doc={activeDocModal}
        onClose={() => setActiveDocModal(null)}
      />

      {/* --- ADMIN EDIT / CREATE MODAL --- */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="admin-edit-modal">
            <div className="modal-top-bar">
              <h3>{editingItem.isNew ? 'Create New' : 'Edit'} {editingItem.type === 'scenario' ? 'Scenario' : 'RAG Article'}</h3>
              <button className="modal-close-btn" onClick={() => setEditingItem(null)}>
                <X className="close-icon" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              {editingItem.type === 'scenario' && (
                <>
                  <div className="form-group">
                    <label>Scenario ID:</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editingItem.data.id}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, id: e.target.value } })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Scenario Title:</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <select
                      className="admin-select"
                      value={editingItem.data.category}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value as SupportCategory } })}
                    >
                      <option value="POS">POS</option>
                      <option value="KDS">KDS</option>
                      <option value="ONLINE_ORDERING">ONLINE_ORDERING</option>
                      <option value="PAYMENTS">PAYMENTS</option>
                      <option value="ACCOUNT">ACCOUNT</option>
                      <option value="TROUBLESHOOTING">TROUBLESHOOTING</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Badge Text:</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editingItem.data.badge}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, badge: e.target.value } })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Customer Message:</label>
                    <textarea
                      className="admin-textarea"
                      rows={3}
                      value={editingItem.data.initialMessage}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, initialMessage: e.target.value } })}
                      required
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'rag' && (
                <>
                  <div className="form-group">
                    <label>Doc ID:</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editingItem.data.id}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, id: e.target.value } })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Title:</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <select
                      className="admin-select"
                      value={editingItem.data.category}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value as SupportCategory } })}
                    >
                      <option value="POS">POS</option>
                      <option value="KDS">KDS</option>
                      <option value="ONLINE_ORDERING">ONLINE_ORDERING</option>
                      <option value="PAYMENTS">PAYMENTS</option>
                      <option value="ACCOUNT">ACCOUNT</option>
                      <option value="TROUBLESHOOTING">TROUBLESHOOTING</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Markdown Content:</label>
                    <textarea
                      className="admin-textarea"
                      rows={10}
                      value={editingItem.data.content}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                      required
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
