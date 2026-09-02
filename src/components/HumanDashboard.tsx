import React, { useState } from 'react';
import { EscalationTicket } from '../types/agent';
import { exportLiveHumanSessionJSON } from '../utils/jsonHistoryExporter';
import { appStore } from '../store/appStore';
import { FormattedText } from '../utils/formatText';
import { 
  Headphones, 
  CheckCircle, 
  XCircle, 
  Send, 
  Wrench, 
  FileText, 
  User, 
  ChevronRight,
  AlertTriangle,
  Download,
  Trash2
} from 'lucide-react';

interface HumanDashboardProps {
  tickets: EscalationTicket[];
  onApproveAction: (ticketId: string) => void;
  onRejectAction: (ticketId: string) => void;
  onSendHumanMessage: (ticketId: string, messageText: string) => void;
}

export const HumanDashboard: React.FC<HumanDashboardProps> = ({
  tickets,
  onApproveAction,
  onRejectAction,
  onSendHumanMessage
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    tickets.length > 0 ? tickets[0].id : null
  );
  const [humanInput, setHumanInput] = useState('');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const cleanSummaryText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/^>\s*💬\s*\*Replying to.*?\*\s*/gis, '')
      .replace(/^>.*$/gm, '')
      .replace(/[\*#_`]/g, '')
      .trim();
  };

  const handleSendResponse = () => {
    if (!humanInput.trim() || !selectedTicket) return;
    onSendHumanMessage(selectedTicket.id, humanInput);
    setHumanInput('');
  };

  if (!tickets || tickets.length === 0) {
    return (
      <div className="empty-dashboard">
        <Headphones className="empty-icon" />
        <h3>No Escalated Support Tickets</h3>
        <p>All customer interactions are currently being handled by the Autonomous AI Support Agent. Switch to the Customer Chat tab to simulate an issue or trigger an escalation scenario.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Escalation Ticket Queue */}
      <div className="ticket-sidebar">
        <div className="sidebar-header">
          <Headphones className="header-icon" />
          <span className="header-title">Human Handoff</span>
          <span className="queue-count">{tickets.length}</span>
          <button
            className="btn-clear-queue"
            onClick={() => {
              if (confirm('Are you sure you want to clear all escalated tickets from the Admin history?')) {
                appStore.clearAllTickets();
              }
            }}
            title="Clear all tickets from Admin queue"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Trash2 style={{ width: 12, height: 12 }} />
            <span>Clear Queue</span>
          </button>
        </div>

        <div className="ticket-list">
          {tickets.map((t) => (
            <div
              key={t.id}
              className={`ticket-card ${selectedTicketId === t.id ? 'active' : ''}`}
              onClick={() => setSelectedTicketId(t.id)}
            >
              <div className="card-top">
                <span className={`severity-badge ${t.severity.toLowerCase()}`}>
                  {t.severity}
                </span>
                <span className="ticket-id">#{t.id}</span>
                <span className="ticket-time">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="card-customer">{t.customerName} • {t.outletName}</div>
              <div className="card-summary">{cleanSummaryText(t.summary)}</div>

              {t.controlledAction && t.controlledAction.status === 'PENDING' && (
                <div className="pending-action-pill">
                  <AlertTriangle className="pill-icon" />
                  <span>Refund Approval Required (₹{t.controlledAction.amount})</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Ticket Inspection & Action Center */}
      {selectedTicket ? (
        <div className="ticket-main-workspace">
          {/* Header Bar */}
          <div className="workspace-header">
            <div className="header-left">
              <h2>Ticket #{selectedTicket.id}</h2>
              <span className={`status-tag ${selectedTicket.status.toLowerCase()}`}>
                {selectedTicket.status}
              </span>
              <span className="category-tag">{selectedTicket.category}</span>
            </div>

            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="outlet-name">{selectedTicket.outletName}</span>

              <button
                className="btn-export-session-json"
                onClick={() => exportLiveHumanSessionJSON(selectedTicket)}
                title="Download Live Session Transcript & Diagnostics as JSON File"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(236, 72, 153, 0.15)',
                  border: '1px solid rgba(236, 72, 153, 0.4)',
                  color: '#EC4899',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Download style={{ width: 14, height: 14 }} />
                <span>Export Session JSON Log</span>
              </button>

              <button
                className="btn-delete-ticket"
                onClick={() => {
                  if (confirm(`Delete ticket #${selectedTicket.id}?`)) {
                    appStore.deleteTicket(selectedTicket.id);
                  }
                }}
                title="Delete this ticket"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#EF4444',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                <Trash2 style={{ width: 14, height: 14 }} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="workspace-grid">
            {/* Left Column: Context Handoff Trace */}
            <div className="context-panel">
              <div className="panel-section">
                <h3>
                  <FileText className="section-icon" />
                  Handoff Context & Diagnostic Summary
                </h3>
                <div className="context-box">
                  <p><strong>Customer Issue:</strong> {cleanSummaryText(selectedTicket.summary)}</p>
                  <p><strong>Restaurant Outlet:</strong> {selectedTicket.outletName}</p>
                </div>
              </div>

              <div className="panel-section">
                <h3>
                  <Wrench className="section-icon" />
                  Steps & Tool Diagnostics Performed by AI
                </h3>
                <ul className="steps-list">
                  {selectedTicket.stepsAttempted.map((step, i) => (
                    <li key={i}>
                      <ChevronRight className="bullet-icon" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Controlled Action Approval Box */}
              {selectedTicket.controlledAction && (
                <div className={`controlled-action-box ${selectedTicket.controlledAction.status.toLowerCase()}`}>
                  <div className="action-box-header">
                    <AlertTriangle className="header-icon" />
                    <h4>Controlled Action Request: {selectedTicket.controlledAction.description}</h4>
                  </div>

                  <div className="action-details">
                    <p>Amount: <strong>₹{selectedTicket.controlledAction.amount}</strong></p>
                    <p>Reason: {selectedTicket.controlledAction.reason}</p>
                    <p>Current Status: <strong>{selectedTicket.controlledAction.status}</strong></p>
                  </div>

                  {selectedTicket.controlledAction.status === 'PENDING' ? (
                    <div className="approval-actions">
                      <button
                        className="btn-approve"
                        onClick={() => onApproveAction(selectedTicket.id)}
                      >
                        <CheckCircle className="btn-icon" />
                        Approve & Execute Refund
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => onRejectAction(selectedTicket.id)}
                      >
                        <XCircle className="btn-icon" />
                        Reject Request
                      </button>
                    </div>
                  ) : (
                    <div className="action-completed-banner">
                      <CheckCircle className="banner-icon" />
                      <span>Action {selectedTicket.controlledAction.status} by Human Support Agent</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Live Chat History & Handoff Intercept */}
            <div className="chat-intercept-panel">
              <h3>
                <User className="section-icon" />
                Live Conversation Log & Take-Over
              </h3>

              <div className="intercept-history">
                {selectedTicket.conversationHistory.map((m) => (
                  <div key={m.id} className={`chat-line ${m.sender}`}>
                    <div className="line-text">
                      <FormattedText content={m.content} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Human Response Input */}
              <div className="intercept-input-box">
                <input
                  type="text"
                  placeholder="Type a message to take over customer conversation..."
                  value={humanInput}
                  onChange={(e) => setHumanInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendResponse()}
                />
                <button 
                  className="btn-send-human"
                  onClick={handleSendResponse}
                >
                  <Send className="send-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
