import { PredefinedScenario } from '../types/agent';

export const PREDEFINED_SCENARIOS: PredefinedScenario[] = [
  {
    id: "SCENARIO-1",
    title: "1. Printer Hardware Issue",
    category: "POS",
    badge: "Hardware & Diagnostics",
    description: "Customer reports receipt printer failure at Indiranagar outlet.",
    initialMessage: "My thermal receipt printer isn't working at Indiranagar Outlet #12.",
    restaurantId: "REST-101",
    outletId: "OUTLET-12",
    expectedFlow: [
      "Classify as POS Hardware issue",
      "Search RAG Knowledge Base for thermal printer troubleshooting",
      "Invoke `get_printer_status('OUTLET-12')`",
      "Detect PAPER_JAM state and call `get_last_successful_print('PRINTER-101')`",
      "Analyze root cause & output step-by-step resolution guide"
    ]
  },
  {
    id: "SCENARIO-2",
    title: "2. Payment Deducted, Order Pending",
    category: "PAYMENTS",
    badge: "Discrepancy Investigation",
    description: "Money deducted via UPI for Order #1024 but order status is pending.",
    initialMessage: "Payment was deducted for Order #1024 but my order isn't confirmed.",
    restaurantId: "REST-101",
    outletId: "OUTLET-12",
    expectedFlow: [
      "Classify as Payment/Order discrepancy",
      "Retrieve RAG knowledge on UPI callback delays",
      "Invoke `get_order('1024')` and `get_payment_status('1024')`",
      "Compare Payment (CAPTURED) vs Order (PENDING_APPROVAL)",
      "Explain 15-min auto-reconciliation or initiate controlled escalation"
    ]
  },
  {
    id: "SCENARIO-3",
    title: "3. KDS Orders Not Syncing",
    category: "KDS",
    badge: "Kitchen Telemetry",
    description: "Kitchen display screen is not receiving orders from online portal.",
    initialMessage: "Orders are not appearing on our kitchen screen at Outlet #12.",
    restaurantId: "REST-101",
    outletId: "OUTLET-12",
    expectedFlow: [
      "Classify as KDS Sync issue",
      "Search RAG KB for WebSocket relay issues",
      "Invoke `get_kds_status('OUTLET-12')`",
      "Identify WebSocket disconnect & queued orders count",
      "Provide step-by-step socket reset protocol"
    ]
  },
  {
    id: "SCENARIO-4",
    title: "4. Controlled Action (Refund Approval)",
    category: "PAYMENTS",
    badge: "Guardrail & Permissions",
    description: "Customer requests ₹1,600 refund for failed Order #1089.",
    initialMessage: "Order #1089 failed after my payment of ₹1600. Please refund my order.",
    restaurantId: "REST-101",
    outletId: "OUTLET-12",
    expectedFlow: [
      "Verify order #1089 status and payment ledger",
      "Calculate refund eligibility (₹1600)",
      "Evaluate policy guardrails (Amount > ₹500 threshold)",
      "Trigger Controlled Action Pending State (`initiate_refund`)",
      "Escalate ticket to Human Support Dashboard for approval"
    ]
  },
  {
    id: "SCENARIO-5",
    title: "5. Context Memory & History Trace",
    category: "TROUBLESHOOTING",
    badge: "Conversation Memory",
    description: "Follow-up question referencing previously mentioned order.",
    initialMessage: "What about my previous order #1023?",
    restaurantId: "REST-101",
    outletId: "OUTLET-12",
    expectedFlow: [
      "Access conversation memory context",
      "Identify target order reference #1023",
      "Invoke `get_order('1023')`",
      "Confirm Order #1023 was successfully printed and delivered"
    ]
  },
  {
    id: "SCENARIO-6",
    title: "6. Critical Outage & Human Handoff",
    category: "POS",
    badge: "Critical Escalation",
    description: "Complete POS network crash during peak operational hours.",
    initialMessage: "CRITICAL: POS system is completely offline at Koramangala Outlet #15 during lunch rush!",
    restaurantId: "REST-101",
    outletId: "OUTLET-15",
    expectedFlow: [
      "Detect CRITICAL severity level",
      "Invoke `get_outlet('OUTLET-15')` and detect POS offline mode",
      "Create high-priority support ticket `create_support_ticket()`",
      "Package complete context trace and handoff live conversation to Human Agent workspace"
    ]
  }
];
