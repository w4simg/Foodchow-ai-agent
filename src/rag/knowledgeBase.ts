import { RAGDocument, RAGSearchResult, SupportCategory } from '../types/agent';

export const FOODCHOW_KNOWLEDGE_BASE: RAGDocument[] = [
  {
    id: "KB-POS-001",
    title: "POS Printer Offline & Paper Jam Troubleshooting Guide",
    category: "POS",
    tags: ["printer", "paper jam", "pos hardware", "receipt", "kot", "offline printer"],
    lastUpdated: "2026-08-20",
    content: `
# POS Printer Troubleshooting Guide

### Symptoms:
- Thermal receipt printer or kitchen printer stops printing tickets.
- Status shows PAPER_JAM, OUT_OF_PAPER, or OFFLINE.

### Diagnostic Steps:
1. Verify physical power connection and ensure the thermal paper roll is loaded core-facing down.
2. Check physical LED indicator on the printer:
   - **Solid Red/Orange**: Paper roll empty or lever unlatched.
   - **Blinking Red**: Paper Jam or thermal print head overheat.
   - **Off**: Power cable unplugged or switch off.
3. Open printer lid, clear jammed paper, ensure thermal paper roller is free, and push down till click.
4. Verify LAN/Ethernet IP address assignment (Default static IP: 192.168.1.150).
5. Run diagnostic tool 'get_printer_status()' to verify IP ping and status flag.
6. Trigger test print via FoodChow POS -> Settings -> Hardware -> Test Print.
    `
  },
  {
    id: "KB-POS-002",
    title: "POS Order Sync Failure & Offline Mode Guide",
    category: "POS",
    tags: ["pos sync", "offline mode", "network error", "gst billing", "order stuck"],
    lastUpdated: "2026-08-25",
    content: `
# POS Order Sync & Offline Recovery

### Symptoms:
- Orders placed on POS show yellow 'Pending Sync' icon.
- Orders not reaching kitchen or online portal.

### Root Causes:
- Local Wi-Fi network disconnected from internet.
- Local SQLite sync buffer queue full.
- Incorrect GST tax slab configuration in store settings.

### Solution & Resolution Steps:
1. Check POS network connection under POS Settings -> Network Status.
2. If POS network status is OFFLINE, enable FoodChow Local Offline Queueing Mode.
3. Ensure GST / Billing configuration matches the outlet state (CGST + SGST vs IGST).
4. Force sync pending transactions by tapping 'Sync Now' in top navigation bar.
5. If persistent API timeout occurs, restart FoodChow Sync Service via 'get_outlet()' diagnostic check.
    `
  },
  {
    id: "KB-KDS-001",
    title: "Kitchen Display System (KDS) Order Telemetry & Sync",
    category: "KDS",
    tags: ["kds", "kitchen screen", "kot missing", "order not appearing", "websocket"],
    lastUpdated: "2026-08-22",
    content: `
# KDS Kitchen Screen Missing Orders Guide

### Symptoms:
- Customer places order online or at POS, but order doesn't display on KDS screen.

### Diagnostic Checks:
1. Check KDS station filter settings. (e.g. Cold Kitchen station might not display Hot Mains orders).
2. Check WebSocket relay status: KDS listens on port 8088.
3. Run diagnostic tool 'get_kds_status(outletId)' to inspect screen ping and socket heartbeat.
4. If socket state is DISCONNECTED, refresh KDS application or click 'Reconnect Socket'.
5. If order status is PENDING_APPROVAL on payment backend, KDS will withhold ticket until payment webhook confirms.
    `
  },
  {
    id: "KB-PAY-001",
    title: "Payment Deducted but Order Pending / Failed Resolution",
    category: "PAYMENTS",
    tags: ["payment deducted", "order pending", "upi failure", "refund", "double charge"],
    lastUpdated: "2026-08-28",
    content: `
# Payment Deducted but Order Pending Guide

### Customer Impact:
- Customer paid via UPI/Card, money deducted from bank account, but order remains 'PENDING' or 'FAILED'.

### Protocol & Troubleshooting Flow:
1. Run diagnostic tool 'get_order(orderId)' and 'get_payment_status(orderId)'.
2. Compare Payment Gateway status (CAPTURED / SUCCESS) against Order status (PENDING_APPROVAL / FAILED).
3. If Payment Gateway shows SUCCESS but Order state is FAILED due to kitchen rejection/timeout:
   - System is eligible for Instant Refund or Manual Confirmation.
   - For refunds > $20 or ₹500, trigger controlled action approval flow via Human Support Escalation.
   - For auto-refundable orders, call 'initiate_refund(orderId, amount)'.
4. Explain clearly to customer that bank reference TXN ID has been logged and issue will resolve within 15 mins or via automatic reversal.
    `
  },
  {
    id: "KB-ONLINE-001",
    title: "Online Menu Changes Not Reflecting & Item Sold Out Controls",
    category: "ONLINE_ORDERING",
    tags: ["menu sync", "sold out", "item unavailable", "price update", "online ordering"],
    lastUpdated: "2026-08-15",
    content: `
# Online Menu & Stock Inventory Management

### Issues:
- Item turned off in POS still shows available on web/app.
- Price updates made in Admin portal not reflecting.

### Steps to Fix:
1. Menu updates require a CDN purge cycle (up to 2 minutes).
2. Check 'get_menu_status(outletId)' tool response.
3. Toggle item status to 86/Sold Out directly from FoodChow Live Menu Manager.
4. If cached on aggregator partners (Swiggy/Zomato/UberEats integration), force sync partner menu channel.
    `
  },
  {
    id: "KB-ACC-001",
    title: "Account Security, Password Reset & Outlet Settings",
    category: "ACCOUNT",
    tags: ["password reset", "account lock", "outlet details", "gst update", "security"],
    lastUpdated: "2026-08-10",
    content: `
# Account Management & Access Recovery

### Features:
- Password Reset: Trigger official reset email link to registered owner email.
- Account Security: Escalation mandatory if customer suspects unauthorized login or bank detail change.
- Updating Restaurant Tax/GST: Requires verified document upload via Support Dashboard.
    `
  }
];

export function searchKnowledgeBase(query: string, category?: SupportCategory): RAGSearchResult[] {
  if (!query || query.trim().length === 0) return [];

  const tokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);

  const results: RAGSearchResult[] = FOODCHOW_KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const matchedKeywords: string[] = [];

    const lowerTitle = doc.title.toLowerCase();
    const lowerContent = doc.content.toLowerCase();

    // Category match bonus
    if (category && doc.category === category) {
      score += 3.0;
    }

    tokens.forEach(token => {
      // Check title match
      if (lowerTitle.includes(token)) {
        score += 2.5;
        matchedKeywords.push(token);
      }

      // Check tags match
      if (doc.tags.some(tag => tag.includes(token))) {
        score += 3.0;
        if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
      }

      // Check content match
      if (lowerContent.includes(token)) {
        score += 1.0;
        if (!matchedKeywords.includes(token)) matchedKeywords.push(token);
      }
    });

    return {
      doc,
      score,
      matchedKeywords
    };
  });

  return results
    .filter(r => r.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
