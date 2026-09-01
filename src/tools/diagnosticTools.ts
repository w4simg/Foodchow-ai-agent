import { MOCK_ORDERS, MOCK_RESTAURANTS } from '../data/mockData';
import { ToolCallRecord, ControlledActionDetails } from '../types/agent';

export class DiagnosticTools {
  private static generateId(): string {
    return 'TOOL_' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  // 1. get_restaurant
  static async get_restaurant(restaurantId: string): Promise<{ record: ToolCallRecord; data: any }> {
    const startTime = Date.now();
    const restaurant = MOCK_RESTAURANTS.find(r => r.id === restaurantId || r.name.toLowerCase().includes(restaurantId.toLowerCase()));
    const duration = Date.now() - startTime;

    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'get_restaurant',
      args: { restaurantId },
      result: restaurant ? restaurant : { error: "Restaurant not found", code: 404 },
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: restaurant ? 'SUCCESS' : 'FAILED'
    };

    return { record, data: record.result };
  }

  // 2. get_outlet
  static async get_outlet(outletId: string): Promise<{ record: ToolCallRecord; data: any }> {
    const startTime = Date.now();
    let foundOutlet = null;

    for (const r of MOCK_RESTAURANTS) {
      const match = r.outlets.find(o => o.id === outletId || o.name.toLowerCase().includes(outletId.toLowerCase()));
      if (match) {
        foundOutlet = match;
        break;
      }
    }

    const duration = Date.now() - startTime;
    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'get_outlet',
      args: { outletId },
      result: foundOutlet ? foundOutlet : { error: `Outlet ${outletId} not found`, code: 404 },
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: foundOutlet ? 'SUCCESS' : 'FAILED'
    };

    return { record, data: record.result };
  }

  // 3. get_order
  static async get_order(orderId: string): Promise<{ record: ToolCallRecord; data: any }> {
    const startTime = Date.now();
    const cleanId = orderId.replace('#', '').trim();
    const order = MOCK_ORDERS.find(o => o.id === cleanId);
    const duration = Date.now() - startTime;

    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'get_order',
      args: { orderId },
      result: order ? order : { error: `Order #${cleanId} not found in database`, code: 404 },
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: order ? 'SUCCESS' : 'FAILED'
    };

    return { record, data: record.result };
  }

  // 4. get_order_status
  static async get_order_status(orderId: string): Promise<{ record: ToolCallRecord; data: any }> {
    const startTime = Date.now();
    const cleanId = orderId.replace('#', '').trim();
    const order = MOCK_ORDERS.find(o => o.id === cleanId);
    const duration = Date.now() - startTime;

    const result = order ? {
      orderId: order.id,
      orderStatus: order.orderStatus,
      kdsSyncStatus: order.kdsSyncStatus,
      printStatus: order.printStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    } : { error: `Order #${cleanId} not found`, code: 404 };

    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'get_order_status',
      args: { orderId },
      result,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: order ? 'SUCCESS' : 'FAILED'
    };

    return { record, data: result };
  }

  // 5. get_payment_status
  static async get_payment_status(orderIdOrTxnId: string): Promise<{ record: ToolCallRecord; data: any }> {
    const startTime = Date.now();
    const cleanId = orderIdOrTxnId.replace('#', '').trim();
    const order = MOCK_ORDERS.find(o => o.id === cleanId || o.transactionId === cleanId);
    const duration = Date.now() - startTime;

    const result = order ? {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      amountPaid: order.totalAmount,
      gatewayResponseCode: order.paymentStatus === 'PAID' ? '200_OK_CAPTURED' : '402_PENDING_GATEWAY_CALLBACK'
    } : { error: `No payment record for ID ${cleanId}`, code: 404 };

    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'get_payment_status',
      args: { orderIdOrTxnId },
      result,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: order ? 'SUCCESS' : 'FAILED'
    };

    return { record, data: result };
  }

  // 6. get_printer_status
  static async get_printer_status(outletIdOrPrinterId: string): Promise<{ record: ToolCallRecord; data: any }> {
    const startTime = Date.now();
    let printer = null;

    for (const r of MOCK_RESTAURANTS) {
      for (const o of r.outlets) {
        if (o.id === outletIdOrPrinterId || o.name.toLowerCase().includes(outletIdOrPrinterId.toLowerCase())) {
          printer = o.printers[0];
          break;
        }
        const pMatch = o.printers.find(p => p.id === outletIdOrPrinterId || p.name.toLowerCase().includes(outletIdOrPrinterId.toLowerCase()));
        if (pMatch) {
          printer = pMatch;
          break;
        }
      }
    }

    // Default fallback mock if outlet match found in default list
    if (!printer) {
      printer = MOCK_RESTAURANTS[0].outlets[0].printers[0]; // Front Counter printer (PAPER_JAM)
    }

    const duration = Date.now() - startTime;
    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'get_printer_status',
      args: { outletIdOrPrinterId },
      result: printer,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: 'SUCCESS'
    };

    return { record, data: printer };
  }

  // 7. get_last_successful_print
  static async get_last_successful_print(printerId: string): Promise<{ record: ToolCallRecord; data: any }> {
    const startTime = Date.now();
    const res = {
      printerId,
      lastPrintTime: "2026-09-01T10:45:00Z",
      timeElapsedMinutes: 38,
      lastPrintedOrder: "1023",
      status: "PAPER_JAM_DETECTED_DURING_ORDER_1024"
    };
    const duration = Date.now() - startTime;

    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'get_last_successful_print',
      args: { printerId },
      result: res,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: 'SUCCESS'
    };

    return { record, data: res };
  }

  // 8. get_kds_status
  static async get_kds_status(outletId: string): Promise<{ record: ToolCallRecord; data: any }> {
    const startTime = Date.now();
    const res = {
      outletId,
      kdsScreenName: "Main Kitchen Display #1",
      socketConnected: false,
      lastHeartbeat: "2026-09-01T10:55:12Z",
      queuedOrdersCount: 3,
      statusMessage: "KDS Screen Socket disconnected. Network sync error."
    };
    const duration = Date.now() - startTime;

    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'get_kds_status',
      args: { outletId },
      result: res,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: 'SUCCESS'
    };

    return { record, data: res };
  }

  // 9. get_menu_status
  static async get_menu_status(outletId: string): Promise<{ record: ToolCallRecord; data: any }> {
    const startTime = Date.now();
    const res = {
      outletId,
      activeMenuVersion: "v4.1.2",
      totalActiveItems: 142,
      soldOutItemsCount: 3,
      soldOutItems: ["Paneer Tikka", "Mango Lassi", "Garlic Bread"],
      lastCdnPurge: "2026-09-01T08:00:00Z"
    };
    const duration = Date.now() - startTime;

    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'get_menu_status',
      args: { outletId },
      result: res,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: 'SUCCESS'
    };

    return { record, data: res };
  }

  // 10. Controlled Action: initiate_refund
  static async initiate_refund(orderId: string, amount: number, reason: string): Promise<{ record: ToolCallRecord; action: ControlledActionDetails }> {
    const startTime = Date.now();
    const cleanId = orderId.replace('#', '').trim();
    const requiresApproval = amount > 500 || amount > 20; // Amounts over threshold require human authorization

    const action: ControlledActionDetails = {
      id: 'ACT_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      actionName: 'REFUND_ORDER',
      description: `Initiate full refund of ₹${amount} for Order #${cleanId}`,
      params: { orderId: cleanId, amount, reason },
      status: requiresApproval ? 'PENDING' : 'EXECUTED',
      requestedBy: 'FoodChow AI Support Agent',
      amount,
      reason
    };

    const duration = Date.now() - startTime;
    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'initiate_refund',
      args: { orderId: cleanId, amount, reason },
      result: {
        actionId: action.id,
        status: action.status,
        message: requiresApproval 
          ? `Refund of ₹${amount} exceeds instant AI limit. Escalated to Human Agent for approval.`
          : `Refund of ₹${amount} successfully processed via gateway.`
      },
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: requiresApproval ? 'REQUIRES_APPROVAL' : 'SUCCESS'
    };

    return { record, action };
  }

  // 11. create_support_ticket
  static async create_support_ticket(ticketDetails: {
    customerName: string;
    outletId: string;
    category: any;
    severity: any;
    summary: string;
  }): Promise<{ record: ToolCallRecord; ticketId: string }> {
    const startTime = Date.now();
    const ticketId = 'TICK-' + Math.floor(100000 + Math.random() * 900000);
    const duration = Date.now() - startTime;

    const res = {
      ticketId,
      status: 'OPEN',
      priority: ticketDetails.severity,
      assignedTeam: ticketDetails.category === 'POS' ? 'Tier-2 Hardware & POS Engineering' : 'Customer Success Operations',
      createdTime: new Date().toISOString(),
      estimatedResponseTime: ticketDetails.severity === 'CRITICAL' ? '15 minutes' : '2 hours'
    };

    const record: ToolCallRecord = {
      id: this.generateId(),
      toolName: 'create_support_ticket',
      args: ticketDetails,
      result: res,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      status: 'SUCCESS'
    };

    return { record, ticketId };
  }
}
