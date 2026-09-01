export type SupportCategory = 
  | 'POS' 
  | 'KDS' 
  | 'ONLINE_ORDERING' 
  | 'PAYMENTS' 
  | 'RESTAURANT_SETUP' 
  | 'ACCOUNT' 
  | 'TROUBLESHOOTING';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AgentName = 
  | 'Triage Agent' 
  | 'Knowledge (RAG) Agent' 
  | 'Diagnostic Agent' 
  | 'Action & Guardrail Agent' 
  | 'Escalation Agent';

export type ActionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';

export interface ToolCallRecord {
  id: string;
  toolName: string;
  args: Record<string, any>;
  result: any;
  timestamp: string;
  durationMs: number;
  status: 'SUCCESS' | 'FAILED' | 'REQUIRES_APPROVAL';
}

export interface RAGDocument {
  id: string;
  title: string;
  category: SupportCategory;
  content: string;
  tags: string[];
  lastUpdated: string;
}

export interface RAGSearchResult {
  doc: RAGDocument;
  score: number;
  matchedKeywords: string[];
}

export interface TraceStep {
  id: string;
  agentName: AgentName;
  phase: 'TRIAGE' | 'RETRIEVAL' | 'DIAGNOSTIC' | 'GUARDRAIL' | 'ACTION' | 'ESCALATION';
  thought: string;
  details?: any;
  confidence?: number;
  timestamp: string;
}

export interface ControlledActionDetails {
  id: string;
  actionName: 'REFUND_ORDER' | 'RESET_POS_CONFIG' | 'DELETE_ACCOUNT' | 'UPDATE_OUTLET_STATUS';
  description: string;
  params: Record<string, any>;
  status: ActionStatus;
  requestedBy: string;
  amount?: number;
  reason?: string;
  approvedBy?: string;
  executedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent' | 'human_agent' | 'system';
  content: string;
  timestamp: string;
  category?: SupportCategory;
  confidenceScore?: number;
  traceSteps?: TraceStep[];
  toolCalls?: ToolCallRecord[];
  retrievedDocs?: RAGSearchResult[];
  controlledAction?: ControlledActionDetails;
  isEscalated?: boolean;
  ticketId?: string;
}

export interface EscalationTicket {
  id: string;
  customerName: string;
  restaurantId: string;
  outletName: string;
  category: SupportCategory;
  severity: SeverityLevel;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  summary: string;
  conversationHistory: ChatMessage[];
  stepsAttempted: string[];
  toolResults: ToolCallRecord[];
  controlledAction?: ControlledActionDetails;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
}

export interface PredefinedScenario {
  id: string;
  title: string;
  category: SupportCategory;
  description: string;
  badge: string;
  initialMessage: string;
  restaurantId: string;
  outletId: string;
  expectedFlow: string[];
}
