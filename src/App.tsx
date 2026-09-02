import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CustomerChat } from './components/CustomerChat';
import { AdminPortal } from './components/AdminPortal';
import { ChatMessage, EscalationTicket, PredefinedScenario } from './types/agent';
import { FoodChowAgentEngine } from './agent/agentEngine';
import { appStore } from './store/appStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'admin'>(() => {
    const isPathAdmin = window.location.pathname.includes('/admin') || window.location.hash.includes('/admin');
    return isPathAdmin ? 'admin' : 'chat';
  });

  const [activeOutlet, setActiveOutlet] = useState<string>('OUTLET-12');
  const [theme, setTheme] = useState<'dark' | 'light' | 'soft'>('dark');

  // Listen for URL changes (/admin)
  useEffect(() => {
    const checkRoute = () => {
      const isPathAdmin = window.location.pathname.includes('/admin') || window.location.hash.includes('/admin');
      setActiveTab(isPathAdmin ? 'admin' : 'chat');
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>(() => appStore.getMessages());
  const [tickets, setTickets] = useState<EscalationTicket[]>(() => appStore.getTickets());

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setTickets([...appStore.getTickets()]);
      setMessages([...appStore.getMessages()]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const handleTicketCreated = (newTicket: EscalationTicket) => {
    appStore.addTicket(newTicket);
  };

  const handleApproveAction = (ticketId: string) => {
    appStore.approveTicketAction(ticketId);
  };

  const handleRejectAction = (ticketId: string) => {
    appStore.rejectTicketAction(ticketId);
  };

  const handleSendHumanMessage = (ticketId: string, messageText: string) => {
    appStore.sendHumanMessage(ticketId, messageText);
  };

  const handleRunScenario = async (scenario: PredefinedScenario) => {
    window.location.hash = '#/';
    setActiveTab('chat');
    const customerMsg: ChatMessage = {
      id: 'MSG_' + Math.random().toString(36).substring(2, 9),
      sender: 'customer',
      content: scenario.initialMessage,
      timestamp: new Date().toISOString()
    };

    appStore.addMessage(customerMsg);

    const { agentMessage, newTicket } = await FoodChowAgentEngine.processMessage(
      scenario.initialMessage,
      appStore.getMessages(),
      scenario.outletId || activeOutlet
    );

    appStore.addMessage(agentMessage);
    if (newTicket) {
      handleTicketCreated(newTicket);
    }
  };

  return (
    <div className={`app-root theme-${theme}`}>
      <Header
        activeOutlet={activeOutlet}
        setActiveOutlet={setActiveOutlet}
        theme={theme}
        setTheme={setTheme}
        isAdminPage={activeTab === 'admin'}
      />

      <main className="app-main-content">
        {activeTab === 'chat' && (
          <CustomerChat
            messages={messages}
            setMessages={setMessages}
            onTicketCreated={handleTicketCreated}
            activeOutlet={activeOutlet}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            activeOutlet={activeOutlet}
            setActiveOutlet={setActiveOutlet}
            onRunScenario={handleRunScenario}
            onApproveAction={handleApproveAction}
            onRejectAction={handleRejectAction}
            onSendHumanMessage={handleSendHumanMessage}
          />
        )}
      </main>
    </div>
  );
};

export default App;
