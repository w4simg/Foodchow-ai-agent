import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, EscalationTicket, PredefinedScenario } from '../types/agent';
import { FoodChowAgentEngine } from '../agent/agentEngine';
import { ObservabilityTraceDrawer } from './ObservabilityTraceDrawer';
import { FormattedText } from '../utils/formatText';
import { PREDEFINED_SCENARIOS } from '../data/predefinedScenarios';
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
  MicOff
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

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
    const text = textToSend || inputText;
    if (!text.trim() || isProcessing) return;

    const customerMsg: ChatMessage = {
      id: 'MSG_' + Math.random().toString(36).substring(2, 9),
      sender: 'customer',
      content: text,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...messages, customerMsg];
    setMessages(updatedHistory);
    if (!textToSend) setInputText('');
    setIsProcessing(true);

    try {
      await new Promise(r => setTimeout(r, 600));

      const { agentMessage, newTicket } = await FoodChowAgentEngine.processMessage(
        text,
        updatedHistory,
        activeOutlet
      );

      setMessages(prev => [...prev, agentMessage]);

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
    setMessages([
      {
        id: 'MSG_INIT',
        sender: 'agent',
        content: "👋 Hello! I am the **FoodChow Agentic Support AI**.\n\nI can diagnose hardware issues, check payment status, investigate order discrepancies, manage KDS sync, and process authorized support actions.\n\nHow can I help your restaurant outlet today?",
        timestamp: new Date().toISOString(),
        confidenceScore: 100
      }
    ]);
  };

  return (
    <div className="chat-layout">
      {/* Scenario Chips Bar */}
      <div className="preset-bar">
        <div className="preset-label">
          <Zap className="label-icon" />
          <span>Quick Scenarios:</span>
        </div>
        <div className="chip-scroll">
          {PREDEFINED_SCENARIOS.map(sc => (
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
                    ? 'Restaurant Manager'
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
          className={`icon-btn mic-btn ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
          title="Voice Dictation (Speech to Text)"
        >
          {isListening ? <MicOff className="btn-icon pulse-mic" /> : <Mic className="btn-icon" />}
        </button>

        <input
          type="text"
          className="chat-input"
          placeholder="Describe your issue or order number (e.g. 'Printer not working', 'Order #1024')..."
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
