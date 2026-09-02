import { ChatMessage, EscalationTicket, PredefinedScenario, RAGDocument } from '../types/agent';
import { PREDEFINED_SCENARIOS } from '../data/predefinedScenarios';
import { FOODCHOW_KNOWLEDGE_BASE } from '../data/defaultKnowledgeBase';

type Listener = () => void;

class AppStore {
  private tickets: EscalationTicket[] = [];
  private scenarios: PredefinedScenario[] = [...PREDEFINED_SCENARIOS];
  private knowledgeBase: RAGDocument[] = [...FOODCHOW_KNOWLEDGE_BASE];
  private messages: ChatMessage[] = [
    {
      id: 'MSG_INIT',
      sender: 'agent',
      content: "👋 Hello! I am the **FoodChow Autonomous AI Support Agent**.\n\nI can diagnose POS hardware issues, investigate order & payment discrepancies, check kitchen display telemetry, and handle controlled support actions.\n\nSelect a quick scenario above or type your issue to test the agent!",
      timestamp: new Date().toISOString(),
      confidenceScore: 100
    }
  ];
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (
          e.key === 'foodchow_tickets' || 
          e.key === 'foodchow_scenarios' || 
          e.key === 'foodchow_rag_docs' ||
          e.key === 'foodchow_messages'
        ) {
          this.loadFromStorage();
          this.notify();
        }
      });
    }
  }

  private loadFromStorage() {
    try {
      const savedTickets = localStorage.getItem('foodchow_tickets');
      if (savedTickets) this.tickets = JSON.parse(savedTickets);

      const savedScenarios = localStorage.getItem('foodchow_scenarios');
      if (savedScenarios) this.scenarios = JSON.parse(savedScenarios);

      const savedKB = localStorage.getItem('foodchow_rag_docs');
      if (savedKB) this.knowledgeBase = JSON.parse(savedKB);

      const savedMsgs = localStorage.getItem('foodchow_messages');
      if (savedMsgs) this.messages = JSON.parse(savedMsgs);
    } catch (err) {
      console.warn('[AppStore Storage Load Error]:', err);
    }
  }

  private saveTickets() {
    try {
      localStorage.setItem('foodchow_tickets', JSON.stringify(this.tickets));
    } catch (err) {
      console.warn('[AppStore Save Tickets Error]:', err);
    }
  }

  private saveScenarios() {
    try {
      localStorage.setItem('foodchow_scenarios', JSON.stringify(this.scenarios));
    } catch (err) {
      console.warn('[AppStore Save Scenarios Error]:', err);
    }
  }

  private saveKB() {
    try {
      localStorage.setItem('foodchow_rag_docs', JSON.stringify(this.knowledgeBase));
    } catch (err) {
      console.warn('[AppStore Save RAG Error]:', err);
    }
  }

  private saveMessages() {
    try {
      localStorage.setItem('foodchow_messages', JSON.stringify(this.messages));
    } catch (err) {
      console.warn('[AppStore Save Messages Error]:', err);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- MESSAGES ---
  public getMessages(): ChatMessage[] {
    return this.messages;
  }

  public addMessage(msg: ChatMessage) {
    this.messages = [...this.messages, msg];
    this.saveMessages();
    this.notify();
  }

  public setMessages(msgs: ChatMessage[]) {
    this.messages = msgs;
    this.saveMessages();
    this.notify();
  }

  // --- TICKETS & ACTION APPROVALS ---
  public getTickets(): EscalationTicket[] {
    return this.tickets;
  }

  public addTicket(ticket: EscalationTicket) {
    this.tickets = [ticket, ...this.tickets.filter(t => t.id !== ticket.id)];
    this.saveTickets();
    this.notify();
  }

  public updateTicket(ticketId: string, updates: Partial<EscalationTicket>) {
    this.tickets = this.tickets.map(t => t.id === ticketId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t);
    this.saveTickets();
    this.notify();
  }

  public deleteTicket(ticketId: string) {
    this.tickets = this.tickets.filter(t => t.id !== ticketId);
    this.saveTickets();
    this.notify();
  }

  public clearAllTickets() {
    this.tickets = [];
    this.saveTickets();
    this.notify();
  }

  public clearAllMessages() {
    this.messages = [
      {
        id: 'MSG_INIT',
        sender: 'agent',
        content: "👋 Hello! I am the **FoodChow Agentic Support AI**.\n\nI can diagnose hardware issues, check payment status, investigate order discrepancies, manage KDS sync, and process authorized support actions.\n\nHow can I help your restaurant outlet today?",
        timestamp: new Date().toISOString(),
        confidenceScore: 100
      }
    ];
    this.saveMessages();
    this.notify();
  }

  public approveTicketAction(ticketId: string) {
    const target = this.tickets.find(t => t.id === ticketId);
    if (!target) return;

    const updatedAction = target.controlledAction ? {
      ...target.controlledAction,
      status: 'APPROVED' as const,
      approvedBy: 'Human Support Manager'
    } : undefined;

    // 1. Update ticket in tickets list
    this.tickets = this.tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'RESOLVED',
          controlledAction: updatedAction,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    this.saveTickets();

    // 2. Update existing messages in chat feed referencing this action/ticket
    this.messages = this.messages.map(m => {
      if (m.ticketId === ticketId || (m.controlledAction && updatedAction && m.controlledAction.id === updatedAction.id)) {
        return {
          ...m,
          controlledAction: updatedAction
        };
      }
      return m;
    });

    // 3. Append approval message to chat feed
    const approvalMsg: ChatMessage = {
      id: 'MSG_APPROVED_' + Math.random().toString(36).substring(2, 7),
      sender: 'human_agent',
      content: `✅ **Human Support Manager Approval**: Refund request for Ticket #${ticketId} has been **APPROVED** and initiated via payment gateway.`,
      timestamp: new Date().toISOString()
    };

    this.messages = [...this.messages, approvalMsg];
    this.saveMessages();
    this.notify();
  }

  public rejectTicketAction(ticketId: string) {
    const target = this.tickets.find(t => t.id === ticketId);
    if (!target) return;

    const updatedAction = target.controlledAction ? {
      ...target.controlledAction,
      status: 'REJECTED' as const
    } : undefined;

    // 1. Update ticket in tickets list
    this.tickets = this.tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'RESOLVED',
          controlledAction: updatedAction,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    this.saveTickets();

    // 2. Update existing messages in chat feed
    this.messages = this.messages.map(m => {
      if (m.ticketId === ticketId || (m.controlledAction && updatedAction && m.controlledAction.id === updatedAction.id)) {
        return {
          ...m,
          controlledAction: updatedAction
        };
      }
      return m;
    });

    // 3. Append rejection message to chat feed
    const rejectionMsg: ChatMessage = {
      id: 'MSG_REJECTED_' + Math.random().toString(36).substring(2, 7),
      sender: 'human_agent',
      content: `❌ **Human Support Manager Review**: Refund request for Ticket #${ticketId} was **REJECTED** after manual order verification. Please contact billing ops for further info.`,
      timestamp: new Date().toISOString()
    };

    this.messages = [...this.messages, rejectionMsg];
    this.saveMessages();
    this.notify();
  }

  public sendHumanMessage(ticketId: string, messageText: string) {
    const humanMsg: ChatMessage = {
      id: 'MSG_HUMAN_' + Math.random().toString(36).substring(2, 7),
      sender: 'human_agent',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    // Append to messages feed
    this.messages = [...this.messages, humanMsg];
    this.saveMessages();

    // Append to ticket conversation history
    this.tickets = this.tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          conversationHistory: [...t.conversationHistory, humanMsg],
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    this.saveTickets();
    this.notify();
  }

  // --- SCENARIOS ---
  public getScenarios(): PredefinedScenario[] {
    return this.scenarios;
  }

  public addScenario(scenario: PredefinedScenario) {
    this.scenarios = [scenario, ...this.scenarios.filter(s => s.id !== scenario.id)];
    this.saveScenarios();
    this.notify();
  }

  public updateScenario(scenarioId: string, updates: Partial<PredefinedScenario>) {
    this.scenarios = this.scenarios.map(s => s.id === scenarioId ? { ...s, ...updates } : s);
    this.saveScenarios();
    this.notify();
  }

  public deleteScenario(scenarioId: string) {
    this.scenarios = this.scenarios.filter(s => s.id !== scenarioId);
    this.saveScenarios();
    this.notify();
  }

  // --- KNOWLEDGE BASE ---
  public getKnowledgeBase(): RAGDocument[] {
    return this.knowledgeBase;
  }

  public addRAGDoc(doc: RAGDocument) {
    this.knowledgeBase = [doc, ...this.knowledgeBase.filter(d => d.id !== doc.id)];
    this.saveKB();
    this.notify();
  }

  public updateRAGDoc(docId: string, updates: Partial<RAGDocument>) {
    this.knowledgeBase = this.knowledgeBase.map(d => d.id === docId ? { ...d, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : d);
    this.saveKB();
    this.notify();
  }

  public deleteRAGDoc(docId: string) {
    this.knowledgeBase = this.knowledgeBase.filter(d => d.id !== docId);
    this.saveKB();
    this.notify();
  }
}

export const appStore = new AppStore();
