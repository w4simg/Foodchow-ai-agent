import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CustomerChat } from './components/CustomerChat';
import { HumanDashboard } from './components/HumanDashboard';
import { RAGInspector } from './components/RAGInspector';
import { PredefinedScenariosView } from './components/PredefinedScenariosView';
import { AdminPortal } from './components/AdminPortal';
import { AnalyticsBar } from './components/AnalyticsBar';
import { ChatMessage, EscalationTicket, PredefinedScenario } from './types/agent';
import { FoodChowAgentEngine } from './agent/agentEngine';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'rag' | 'scenarios' | 'admin'>('chat');
  const [activeOutlet, setActiveOutlet] = useState<string>('OUTLET-12');
  const [theme, setTheme] = useState<'dark' | 'light' | 'soft'>('dark');

  // Check URL path or hash for /admin route
  useEffect(() => {
    const checkRoute = () => {
      const isPathAdmin = window.location.pathname.includes('/admin') || window.location.hash.includes('/admin');
      if (isPathAdmin) {
        setActiveTab('admin');
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'MSG_INIT',
      sender: 'agent',
      content: "👋 Hello! I am the **FoodChow Autonomous AI Support Agent**.\n\nI can diagnose POS hardware issues, investigate order & payment discrepancies, check kitchen display telemetry, and handle controlled support actions.\n\nSelect a quick scenario above or type your issue to test the agent!",
      timestamp: new Date().toISOString(),
      confidenceScore: 100
    }
  ]);

  const [tickets, setTickets] = useState<EscalationTicket[]>([]);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const handleTicketCreated = (newTicket: EscalationTicket) => {
    setTickets(prev => [newTicket, ...prev.filter(t => t.id !== newTicket.id)]);
  };

  const handleApproveAction = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId && t.controlledAction) {
        return {
          ...t,
          status: 'RESOLVED',
          controlledAction: {
            ...t.controlledAction,
            status: 'APPROVED',
            approvedBy: 'Human Support Manager'
          }
        };
      }
      return t;
    }));

    setMessages(prev => [
      ...prev,
      {
        id: 'MSG_APPROVED_' + Math.random().toString(36).substring(2, 7),
        sender: 'human_agent',
        content: `✅ **Human Support Manager Approval**: Refund request for Ticket #${ticketId} has been **APPROVED** and initiated via payment gateway.`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const handleRejectAction = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId && t.controlledAction) {
        return {
          ...t,
          status: 'RESOLVED',
          controlledAction: {
            ...t.controlledAction,
            status: 'REJECTED'
          }
        };
      }
      return t;
    }));

    setMessages(prev => [
      ...prev,
      {
        id: 'MSG_REJECTED_' + Math.random().toString(36).substring(2, 7),
        sender: 'human_agent',
        content: `❌ **Human Support Manager Review**: Refund request for Ticket #${ticketId} was **REJECTED** after manual order verification. Please contact billing ops for further info.`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const handleSendHumanMessage = (ticketId: string, messageText: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: 'MSG_HUMAN_' + Math.random().toString(36).substring(2, 7),
        sender: 'human_agent',
        content: messageText,
        timestamp: new Date().toISOString()
      }
    ]);

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          conversationHistory: [
            ...t.conversationHistory,
            {
              id: 'MSG_HUMAN_' + Math.random().toString(36).substring(2, 7),
              sender: 'human_agent',
              content: messageText,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return t;
    }));
  };

  const handleRunScenario = async (scenario: PredefinedScenario) => {
    setActiveTab('chat');
    const customerMsg: ChatMessage = {
      id: 'MSG_' + Math.random().toString(36).substring(2, 9),
      sender: 'customer',
      content: scenario.initialMessage,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...messages, customerMsg];
    setMessages(updatedHistory);

    const { agentMessage, newTicket } = await FoodChowAgentEngine.processMessage(
      scenario.initialMessage,
      updatedHistory,
      scenario.outletId || activeOutlet
    );

    setMessages(prev => [...prev, agentMessage]);
    if (newTicket) {
      handleTicketCreated(newTicket);
    }
  };

  return (
    <div className={`app-root theme-${theme}`}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openTicketsCount={tickets.filter(t => t.status === 'OPEN').length}
        activeOutlet={activeOutlet}
        setActiveOutlet={setActiveOutlet}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="app-main-content">
        <AnalyticsBar 
          totalMessages={messages.length} 
          openTicketsCount={tickets.filter(t => t.status === 'OPEN').length} 
        />

        {activeTab === 'chat' && (
          <CustomerChat
            messages={messages}
            setMessages={setMessages}
            onTicketCreated={handleTicketCreated}
            activeOutlet={activeOutlet}
          />
        )}

        {activeTab === 'dashboard' && (
          <HumanDashboard
            tickets={tickets}
            onApproveAction={handleApproveAction}
            onRejectAction={handleRejectAction}
            onSendHumanMessage={handleSendHumanMessage}
          />
        )}

        {activeTab === 'rag' && <RAGInspector />}

        {activeTab === 'scenarios' && (
          <PredefinedScenariosView onRunScenario={handleRunScenario} />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            activeOutlet={activeOutlet}
            setActiveOutlet={setActiveOutlet}
          />
        )}
      </main>
    </div>
  );
};

export default App;
