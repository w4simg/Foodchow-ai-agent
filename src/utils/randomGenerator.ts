import { EscalationTicket, PredefinedScenario, RAGDocument, SupportCategory, SeverityLevel } from '../types/agent';

const CUSTOMER_NAMES = [
  "Rahul Sharma",
  "Priya Patel",
  "Vikram Malhotra",
  "Ananya Sen",
  "Rajesh Kumar",
  "Sneha Gupta",
  "Devika Nair",
  "Karan Verma",
  "Neha Deshmukh",
  "Arjun Mehta"
];

const OUTLETS = [
  "Central Flagship Outlet #12 (Indiranagar)",
  "Koramangala Tech Hub #15",
  "HSR Layout Sector 3 #08",
  "MG Road Metro Diner #02",
  "Whitefield Cyber Park #20",
  "Jayanagar Commercial Hub #05"
];

const CATEGORIES: SupportCategory[] = [
  'POS',
  'KDS',
  'ONLINE_ORDERING',
  'PAYMENTS',
  'ACCOUNT',
  'TROUBLESHOOTING'
];

const SEVERITIES: SeverityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const ISSUE_SUMMARIES = [
  "Thermal printer paper jam & offline status on main checkout counter.",
  "UPI QR payment deducted ₹1,250 but order status stuck in PENDING_APPROVAL.",
  "Kitchen Display System (KDS) screen missing live orders from Swiggy/Zomato.",
  "POS order sync buffer full resulting in yellow warning indicator on toolbar.",
  "Customer double charged ₹850 via credit card terminal during peak hour.",
  "Online menu prices not updating after menu sync in admin panel."
];

const SCENARIO_TEMPLATES = [
  {
    title: "Aggregator API Webhook Failure",
    category: "ONLINE_ORDERING" as SupportCategory,
    badge: "API Stress Test",
    description: "Orders from online food delivery aggregators not creating tickets in POS.",
    initialMessage: "Online orders from Swiggy are failing to import into our POS system at Outlet #08.",
    expectedFlow: [
      "Detect Online Ordering Webhook Failure",
      "Check API rate limits & token validity",
      "Trigger manual sync pipeline `get_menu_status('OUTLET-08')`",
      "Re-establish webhook connection and dispatch test payload"
    ]
  },
  {
    title: "High Value Refund Guardrail Test",
    category: "PAYMENTS" as SupportCategory,
    badge: "Guardrail Enforcement",
    description: "Customer requesting ₹3,200 refund for cancelled party catering order.",
    initialMessage: "Our party order #4092 of ₹3200 was cancelled by customer. Please process full refund immediately.",
    expectedFlow: [
      "Inspect Order #4092 cancellation policy",
      "Verify total amount (₹3,200 > ₹500 AI threshold)",
      "Enforce safety guardrail & halt automatic payout",
      "Escalate ticket to Human Support Manager workspace with full ledger trace"
    ]
  },
  {
    title: "KDS Screen Socket Timeout",
    category: "KDS" as SupportCategory,
    badge: "Kitchen Telemetry",
    description: "Kitchen display screen lost WebSocket connection during dinner rush.",
    initialMessage: "KDS Display #2 at Indiranagar outlet went blank and stopped receiving new tickets.",
    expectedFlow: [
      "Ping KDS WebSocket relay port 8088",
      "Identify socket drop & unacknowledged order buffer",
      "Execute telemetry diagnostic `get_kds_status('OUTLET-12')`",
      "Output socket auto-reconnect step-by-step instructions"
    ]
  }
];

const KB_TEMPLATES = [
  {
    title: "UPI Dynamic QR Code Generator & Settlement Guide",
    category: "PAYMENTS" as SupportCategory,
    tags: ["upi", "qr code", "settlement", "phonepe", "gpay", "payment gateway"],
    content: `# UPI QR Code & Payment Settlement Protocol

### Quick Troubleshooting:
1. Ensure POS display is connected to local internet gateway.
2. If dynamic QR code fails to render, check Merchant VPA configuration under Settings -> Payment Terminals.
3. For pending UPI settlements, verify gateway webhook health via 'get_payment_status(orderId)'.
4. Automatic refunds for failed UPI callbacks settle within 15 minutes.`
  },
  {
    title: "Aggregator Integration (Swiggy / Zomato / UberEats) Setup",
    category: "ONLINE_ORDERING" as SupportCategory,
    tags: ["swiggy", "zomato", "aggregators", "webhook", "menu sync", "delivery"],
    content: `# Food Delivery Aggregator Integration Guide

### Key Steps:
1. Navigate to FoodChow Admin -> Integrations -> Delivery Partners.
2. Enter API Partner Key provided by aggregator account manager.
3. Turn on 'Auto-Accept Orders' to avoid order cancellation penalties.
4. If menu changes don't sync, perform CDN Cache Purge in Admin Portal.`
  }
];

export function generateRandomTicket(): EscalationTicket {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const id = `TCK-${randNum}`;
  const customerName = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
  const outletName = OUTLETS[Math.floor(Math.random() * OUTLETS.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
  const summary = ISSUE_SUMMARIES[Math.floor(Math.random() * ISSUE_SUMMARIES.length)];

  return {
    id,
    customerName,
    restaurantId: "REST-101",
    outletName,
    category,
    severity,
    status: 'OPEN',
    summary,
    conversationHistory: [
      {
        id: `M_${Math.random().toString(36).substring(2, 7)}`,
        sender: 'customer',
        content: `Hi support, we are facing an urgent issue at ${outletName}: ${summary}`,
        timestamp: new Date().toISOString()
      }
    ],
    stepsAttempted: [
      `Auto-generated diagnostic check for ${category} at ${outletName}`,
      "Captured context log trace and escalated to support queue"
    ],
    toolResults: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function generateRandomScenario(): PredefinedScenario {
  const template = SCENARIO_TEMPLATES[Math.floor(Math.random() * SCENARIO_TEMPLATES.length)];
  const randNum = Math.floor(100 + Math.random() * 900);
  
  return {
    id: `SCENARIO-${randNum}`,
    title: `${template.title} #${randNum}`,
    category: template.category,
    badge: template.badge,
    description: template.description,
    initialMessage: template.initialMessage,
    restaurantId: "REST-101",
    outletId: "OUTLET-12",
    expectedFlow: template.expectedFlow
  };
}

export function generateRandomRAGDoc(): RAGDocument {
  const template = KB_TEMPLATES[Math.floor(Math.random() * KB_TEMPLATES.length)];
  const randNum = Math.floor(100 + Math.random() * 900);

  return {
    id: `KB-GEN-${randNum}`,
    title: `${template.title} (Auto-Gen #${randNum})`,
    category: template.category,
    tags: [...template.tags, `gen-${randNum}`],
    lastUpdated: new Date().toISOString().split('T')[0],
    content: template.content
  };
}
