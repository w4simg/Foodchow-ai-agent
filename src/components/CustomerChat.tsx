import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, EscalationTicket, PredefinedScenario } from '../types/agent';
import { FoodChowAgentEngine } from '../agent/agentEngine';
import { ObservabilityTraceDrawer } from './ObservabilityTraceDrawer';
import { FormattedText } from '../utils/formatText';
import { appStore } from '../store/appStore';
import { exportCustomerChatHistoryJSON } from '../utils/jsonHistoryExporter';
import { 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  Headphones,
  Zap,
  ChevronRight,
  Mic,
  MicOff,
  Copy,
  Check,
  Reply,
  Download,
  X
} from 'lucide-react';

interface CustomerChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onTicketCreated: (ticket: EscalationTicket) => void;
  activeOutlet: string;
}

export const CustomerChat: React.FC<CustomerChatProps> = ({
  messages,
  setMessages,
  onTicketCreated,
  activeOutlet
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [replyingToMsg, setReplyingToMsg] = useState<ChatMessage | null>(null);

  const [scenarios, setScenarios] = useState<PredefinedScenario[]>(() => appStore.getScenarios());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setScenarios([...appStore.getScenarios()]);
    });
    return unsubscribe;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleCopyMessage = (content: string, msgId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleReplyMessage = (msg: ChatMessage) => {
    setReplyingToMsg(msg);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.start();
  };

  const handleSendMessage = async (textToSend?: string) => {
    let text = textToSend || inputText;
    if (!text.trim() || isProcessing) return;

    if (replyingToMsg && !textToSend) {
      const senderTag = replyingToMsg.sender === 'customer' ? 'Customer' : replyingToMsg.sender === 'human_agent' ? 'Human Agent' : 'AI Agent';
      text = `> 💬 *Replying to ${senderTag}: "${replyingToMsg.content.slice(0, 60)}..."*\n\n${text}`;
      setReplyingToMsg(null);
    }

    const customerMsg: ChatMessage = {
      id: 'MSG_' + Math.random().toString(36).substring(2, 9),
      sender: 'customer',
      content: text,
      timestamp: new Date().toISOString()
    };

    appStore.addMessage(customerMsg);
    if (!textToSend) setInputText('');

    // Check if Human Support Specialist has joined/replied in conversation
    const currentMsgs = appStore.getMessages();
    const isHumanActive = currentMsgs.some(m => m.sender === 'human_agent');

    if (isHumanActive) {
      // Human Support Specialist is active: Route customer message to ticket history for Human Agent
      const activeTickets = appStore.getTickets();
      if (activeTickets.length > 0) {
        const latestTicket = activeTickets[0];
        appStore.updateTicket(latestTicket.id, {
          conversationHistory: [...latestTicket.conversationHistory, customerMsg]
        });
      }
      // AI Agent stands down and does NOT interfere!
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise(r => setTimeout(r, 600));

      const { agentMessage, newTicket } = await FoodChowAgentEngine.processMessage(
        text,
        currentMsgs,
        activeOutlet
      );

      appStore.addMessage(agentMessage);

      if (newTicket) {
        onTicketCreated(newTicket);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScenarioClick = (scenario: PredefinedScenario) => {
    handleSendMessage(scenario.initialMessage);
  };

  const handleResetChat = () => {
    appStore.setMessages([
      {
        id: 'MSG_INIT',
        sender: 'agent',
        content: "👋 Hello! I am the **FoodChow Agentic Support AI**.\n\nI can diagnose hardware issues, check payment status, investigate order discrepancies, manage KDS sync, and process authorized support actions.\n\nHow can I help your restaurant outlet today?",
        timestamp: new Date().toISOString(),
        confidenceScore: 100
      }
    ]);
  };

  const isHumanConnected = messages.some(m => m.sender === 'human_agent');

  return (
    <div className="chat-layout">
      {isHumanConnected && (
        <div className="human-takeover-banner" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1rem',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '10px',
          color: '#10B981',
          fontSize: '0.82rem',
          fontWeight: 700,
          margin: '0.5rem 0.5rem 0 0.5rem'
        }}>
          <Headphones style={{ width: 16, height: 16 }} />
          <span>Human Support Specialist Connected — AI Agent Standby (Muted)</span>
        </div>
      )}

      {/* Scenario Chips Bar */}
      <div className="preset-bar">
        <div className="preset-label">
          <Zap className="label-icon" />
          <span>Quick Scenarios:</span>
        </div>
        <div className="chip-scroll">
          {scenarios.map(sc => (
            <button
              key={sc.id}
              className="scenario-chip"
              onClick={() => handleScenarioClick(sc)}
              disabled={isProcessing}
            >
              <span className="chip-badge">{sc.badge}</span>
              <span className="chip-text">{sc.title}</span>
              <ChevronRight className="chip-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="chat-messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.sender}`}>
            <div className="avatar">
              {msg.sender === 'customer' ? (
                <User className="avatar-icon user" />
              ) : msg.sender === 'human_agent' ? (
                <Headphones className="avatar-icon human" />
              ) : (
                <Bot className="avatar-icon agent" />
              )}
            </div>

            <div className="message-content-wrapper">
              <div className="message-header">
                <span className="sender-name">
                  {msg.sender === 'customer'
                    ? 'Customer'
                    : msg.sender === 'human_agent'
                    ? 'Human Support Specialist'
                    : 'FoodChow AI Support Agent'}
                </span>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.isEscalated && (
                  <span className="escalation-tag">
                    <ShieldAlert className="tag-icon" />
                    Escalated Ticket #{msg.ticketId}
                  </span>
                )}
              </div>

              <div className="message-bubble">
                <FormattedText content={msg.content} />

                {/* Controlled Action Card */}
                {msg.controlledAction && (
                  <div className={`action-card ${msg.controlledAction.status.toLowerCase()}`}>
                    <div className="card-status-title">
                      {msg.controlledAction.status === 'PENDING' ? (
                        <Clock className="status-icon pending" />
                      ) : (
                        <CheckCircle className="status-icon success" />
                      )}
                      <span>Action: {msg.controlledAction.description}</span>
                    </div>
                    <div className="card-status-meta">
                      Status: <strong>{msg.controlledAction.status}</strong> • Amount: ₹{msg.controlledAction.amount}
                    </div>
                  </div>
                )}

                {/* Copy & Reply Options Bar */}
                <div className="msg-toolbar">
                  <button
                    className="msg-tool-btn"
                    onClick={() => handleCopyMessage(msg.content, msg.id)}
                    title="Copy Message Text"
                  >
                    {copiedMsgId === msg.id ? <Check style={{ width: 13, height: 13, color: '#10B981' }} /> : <Copy style={{ width: 13, height: 13 }} />}
                    <span>{copiedMsgId === msg.id ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    className="msg-tool-btn"
                    onClick={() => handleReplyMessage(msg)}
                    title="Reply to Message"
                  >
                    <Reply style={{ width: 13, height: 13 }} />
                    <span>Reply</span>
                  </button>
                </div>
              </div>

              {/* Observability Trace Drawer for Agent Messages */}
              {msg.sender === 'agent' && msg.traceSteps && msg.traceSteps.length > 0 && (
                <ObservabilityTraceDrawer
                  steps={msg.traceSteps}
                  toolCalls={msg.toolCalls}
                  retrievedDocs={msg.retrievedDocs}
                  confidenceScore={msg.confidenceScore}
                />
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="message-row agent processing">
            <div className="avatar">
              <Bot className="avatar-icon agent pulsing" />
            </div>
            <div className="message-bubble typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="typing-text">Agent running diagnostic tools & knowledge retrieval...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Quote Bar */}
      {replyingToMsg && (
        <div className="reply-quote-bar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-subtle)',
          borderLeft: '3px solid var(--primary)',
          padding: '0.45rem 0.85rem',
          margin: '0.5rem 0.5rem 0 0.5rem',
          borderRadius: '6px',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', overflow: 'hidden' }}>
            <Reply style={{ width: 14, height: 14, color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Replying to <strong>{replyingToMsg.sender === 'customer' ? 'Customer' : replyingToMsg.sender === 'human_agent' ? 'Human Agent' : 'AI Agent'}</strong>: "{replyingToMsg.content.slice(0, 60)}..."
            </span>
          </div>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => setReplyingToMsg(null)}
            title="Cancel Reply"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      {/* Input Control Box */}
      <div className="chat-input-bar">
        <button
          className="icon-btn"
          onClick={handleResetChat}
          title="Reset Conversation History"
        >
          <RotateCcw className="btn-icon" />
        </button>

        <button
          className="icon-btn"
          onClick={() => exportCustomerChatHistoryJSON(messages)}
          title="Download Customer Chat History as JSON File"
        >
          <Download className="btn-icon" />
        </button>

        <button
          className={`icon-btn mic-btn ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
          title="Voice Dictation (Speech to Text)"
        >
          {isListening ? <MicOff className="btn-icon pulse-mic" /> : <Mic className="btn-icon" />}
        </button>

        <input
          type="text"
          className="chat-input"
          placeholder={isHumanConnected ? "Type your message to Human Support Specialist..." : "Describe your issue or order number (e.g. 'Printer not working', 'Order #1024')..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isProcessing}
        />

        <button
          className="send-btn"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isProcessing}
        >
          <Send className="send-icon" />
        </button>
      </div>
    </div>
  );
};
