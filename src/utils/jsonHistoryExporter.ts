import { ChatMessage, EscalationTicket } from '../types/agent';

export const exportCustomerChatHistoryJSON = (messages: ChatMessage[]) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    sessionType: "CUSTOMER_SUPPORT_CHAT_HISTORY",
    totalMessages: messages.length,
    messages: messages.map(m => ({
      id: m.id,
      sender: m.sender,
      senderLabel: m.sender === 'customer' ? 'Customer' : m.sender === 'human_agent' ? 'Human Support Specialist' : 'FoodChow AI Support Agent',
      content: m.content,
      timestamp: m.timestamp,
      category: m.category || null,
      confidenceScore: m.confidenceScore || null,
      controlledAction: m.controlledAction || null
    }))
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `customer_chat_history_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportLiveHumanSessionJSON = (ticket: EscalationTicket) => {
  const exportData = {
    ticketId: ticket.id,
    sessionType: "LIVE_HUMAN_SUPPORT_SESSION_LOG",
    exportedAt: new Date().toISOString(),
    customerName: ticket.customerName,
    outletName: ticket.outletName,
    category: ticket.category,
    severity: ticket.severity,
    status: ticket.status,
    issueSummary: ticket.summary,
    sessionTimeline: {
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    },
    liveConversationTranscript: ticket.conversationHistory.map(m => ({
      id: m.id,
      sender: m.sender,
      senderLabel: m.sender === 'customer' ? 'Customer' : m.sender === 'human_agent' ? 'Human Support Specialist' : 'AI Agent',
      message: m.content,
      timestamp: m.timestamp
    })),
    agenticDiagnosticsTrace: ticket.stepsAttempted,
    controlledActionRequest: ticket.controlledAction || null
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `live_human_session_${ticket.id}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
