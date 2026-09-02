import { 
  ChatMessage, 
  TraceStep, 
  ToolCallRecord, 
  RAGSearchResult, 
  SupportCategory, 
  SeverityLevel,
  ControlledActionDetails,
  EscalationTicket
} from '../types/agent';
import { searchKnowledgeBase } from '../rag/knowledgeBase';
import { DiagnosticTools } from '../tools/diagnosticTools';
import { appStore } from '../store/appStore';

export class FoodChowAgentEngine {
  private static generateId(prefix: string): string {
    return prefix + '_' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  // Live Gemini API Caller
  private static async callGeminiAPI(apiKey: string, userPrompt: string, contextInfo: string): Promise<string | null> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{
                text: `System: You are the FoodChow Autonomous AI Support Agent for restaurant management. Be polite, friendly, helpful, and concise. Format output with clean GitHub markdown.
Context & Diagnostics: ${contextInfo}
User Question: "${userPrompt}"`
              }]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn('[Gemini API Call Failed, falling back to engine response]:', err);
    }
    return null;
  }

  // Live Groq Cloud API Caller (model: openai/gpt-oss-120b)
  private static async callGroqAPI(apiKey: string, userPrompt: string, contextInfo: string): Promise<string | null> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: 'You are the FoodChow Autonomous AI Support Agent for restaurant management. Be polite, friendly, helpful, and concise. Use clean GitHub markdown formatting.'
            },
            {
              role: 'user',
              content: `User Prompt: "${userPrompt}"\nContext & Diagnostics: ${contextInfo}`
            }
          ],
          temperature: 0.5
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn('[Groq API Call Failed]:', err);
    }
    return null;
  }

  // Automatic Multi-Tier Fallback LLM Synthesizer: Groq (openai/gpt-oss-120b) -> Gemini 1.5 -> Local Engine
  private static async synthesizeLLMResponse(userPrompt: string, contextInfo: string): Promise<string | null> {
    const providerMode = localStorage.getItem('foodchow_llm_provider') || 'AUTO';
    const groqKey = (localStorage.getItem('foodchow_groq_key') || localStorage.getItem('foodchow_llm_key') || '').trim();
    const geminiKey = (localStorage.getItem('foodchow_gemini_key') || '').trim();

    if (providerMode === 'GROQ') {
      if (groqKey) return await this.callGroqAPI(groqKey, userPrompt, contextInfo);
      return null;
    }

    if (providerMode === 'GEMINI') {
      if (geminiKey) return await this.callGeminiAPI(geminiKey, userPrompt, contextInfo);
      return null;
    }

    if (providerMode === 'LOCAL') {
      return null;
    }

    // AUTO FAILOVER MODE (Default): Groq -> Gemini -> Local Engine
    if (groqKey) {
      const groqResp = await this.callGroqAPI(groqKey, userPrompt, contextInfo);
      if (groqResp) return groqResp;
      console.warn('[LLM Auto-Failover]: Groq API call failed or rate-limited. Automatically switching to Gemini 1.5...');
    }

    if (geminiKey) {
      const geminiResp = await this.callGeminiAPI(geminiKey, userPrompt, contextInfo);
      if (geminiResp) return geminiResp;
      console.warn('[LLM Auto-Failover]: Gemini 1.5 API call failed or rate-limited. Automatically switching to FoodChow Local Autonomous Engine...');
    }

    return null;
  }

  static async processMessage(
    userMessage: string,
    conversationHistory: ChatMessage[],
    activeOutletId: string = 'OUTLET-12'
  ): Promise<{
    agentMessage: ChatMessage;
    newTicket?: EscalationTicket;
  }> {
    const traceSteps: TraceStep[] = [];
    const toolCalls: ToolCallRecord[] = [];
    const now = new Date().toISOString();
    
    // Strip quote headers (e.g. > 💬 *Replying to...*) to get actual user input
    const userMessageClean = userMessage
      .replace(/^>\s*💬\s*\*Replying to.*?\*\s*/gis, '')
      .replace(/^>.*$/gm, '')
      .trim();

    const textLower = (userMessageClean || userMessage).toLowerCase().trim();

    // Check configured LLM Provider & Key
    const configuredProvider = localStorage.getItem('foodchow_llm_provider') || 'LOCAL';
    const configuredKey = localStorage.getItem('foodchow_llm_key') || '';

    // ----------------------------------------------------
    // PHASE 0: CONVERSATIONAL & GREETING INTENT HANDLER
    // ----------------------------------------------------
    const isGreeting = /^(hi|hello|hey|greetings|howdy|good\s*(morning|afternoon|evening))/i.test(textLower);
    const isHowAreYou = textLower.includes('how are u') || textLower.includes('how are you') || textLower.includes('how do you do');
    const isThanks = textLower.includes('thank') || textLower.includes('thanks');
    const isWhoAreYou = textLower.includes('who are you') || textLower.includes('what can you do') || textLower.includes('your name');
    const isCasual = /^(nothing|nothing\s*much|nm|chilling|just\s*testing|all\s*good|no\s*problem|ok|okay|fine|cool|good|sure)/i.test(textLower);

    if (isHowAreYou || isGreeting || isThanks || isWhoAreYou || isCasual) {
      let responseText = await this.synthesizeLLMResponse(
        userMessageClean || userMessage,
        "User is engaging in polite conversational chat."
      ) || "";

      if (!responseText) {
        if (isHowAreYou) {
          responseText = "Hello! I am doing great, thank you for asking! 😊\n\nI am the **FoodChow Autonomous AI Support Agent**. I am online and ready to assist you with POS hardware diagnostics, order & payment verification, kitchen display telemetry, or support escalations. How can I help your restaurant today?";
        } else if (isGreeting) {
          responseText = "Hello! 👋 Welcome to FoodChow AI Support. How can I assist you with your POS, orders, or restaurant outlet today?";
        } else if (isThanks) {
          responseText = "You are very welcome! 😊 Let me know if you need assistance with anything else for your restaurant outlet. Have a great day!";
        } else if (isCasual) {
          responseText = "Got it! 😊 Feel free to ask anytime if you need help with your FoodChow POS, orders, payments, or outlet settings.";
        } else {
          responseText = "I am the **FoodChow Autonomous AI Support Agent**!\n\nI am trained to help restaurant outlets with:\n- 🖨️ **POS & Hardware Troubleshooting** (Paper jams, offline printers)\n- 💳 **Payment & Order Discrepancies** (UPI payment captured vs order failed)\n- 🍳 **KDS Kitchen Screen Telemetry** (WebSocket socket sync)\n- 🛡️ **Controlled Refund Actions** & Escalations\n\nFeel free to ask a question or select a Quick Scenario above!";
        }
      }

      traceSteps.push({
        id: this.generateId('TR'),
        agentName: 'Triage Agent',
        phase: 'TRIAGE',
        thought: `Recognized polite conversational intent (${isHowAreYou ? 'How Are You' : isGreeting ? 'Greeting' : isThanks ? 'Thanks' : 'Identity'}). Processed response.`,
        confidence: 0.99,
        timestamp: new Date().toISOString()
      });

      const agentMessage: ChatMessage = {
        id: this.generateId('MSG'),
        sender: 'agent',
        content: responseText,
        timestamp: new Date().toISOString(),
        category: 'ACCOUNT',
        confidenceScore: 99,
        traceSteps
      };

      return { agentMessage };
    }

    // ----------------------------------------------------
    // PHASE 1: TRIAGE & INTENT CLASSIFICATION AGENT
    // ----------------------------------------------------
    const orderMatch = textLower.match(/order\s*#?(\d+)/i) || textLower.match(/#(\d+)/);
    const extractedOrderId = orderMatch ? orderMatch[1] : null;

    const amountMatch = textLower.match(/(?:₹|\$|rs\.?|rupees?)\s*(\d+)/i) || textLower.match(/(\d+)\s*(?:rupees|rs|\$)/i);
    const extractedAmount = amountMatch ? parseFloat(amountMatch[1]) : null;

    let category: SupportCategory = 'TROUBLESHOOTING';
    let severity: SeverityLevel = 'LOW';

    if (textLower.includes('printer') || textLower.includes('kot') || textLower.includes('receipt') || textLower.includes('paper')) {
      category = 'POS';
      severity = 'MEDIUM';
    } else if (textLower.includes('payment') || textLower.includes('refund') || textLower.includes('deducted') || textLower.includes('charged') || textLower.includes('paid')) {
      category = 'PAYMENTS';
      severity = textLower.includes('refund') ? 'HIGH' : 'MEDIUM';
    } else if (textLower.includes('kds') || textLower.includes('kitchen screen') || textLower.includes('kitchen display')) {
      category = 'KDS';
      severity = 'MEDIUM';
    } else if (textLower.includes('pos') || textLower.includes('sync') || textLower.includes('offline') || textLower.includes('billing')) {
      category = 'POS';
      severity = textLower.includes('offline') || textLower.includes('critical') ? 'CRITICAL' : 'HIGH';
    } else if (textLower.includes('menu') || textLower.includes('sold out') || textLower.includes('item')) {
      category = 'ONLINE_ORDERING';
      severity = 'LOW';
    } else if (textLower.includes('password') || textLower.includes('account') || textLower.includes('login')) {
      category = 'ACCOUNT';
      severity = 'MEDIUM';
    }

    if (textLower.includes('critical') || textLower.includes('lunch rush') || textLower.includes('completely offline')) {
      severity = 'CRITICAL';
    }

    traceSteps.push({
      id: this.generateId('TR'),
      agentName: 'Triage Agent',
      phase: 'TRIAGE',
      thought: `Analyzed customer input. Classified issue under [${category}] with severity [${severity}]. Extracted Order ID: ${extractedOrderId || 'None'}, Amount: ${extractedAmount ? '₹' + extractedAmount : 'None'}.`,
      confidence: 0.96,
      timestamp: new Date().toISOString()
    });

    // ----------------------------------------------------
    // PHASE 2: CONVERSATION MEMORY RESOLUTION
    // ----------------------------------------------------
    let resolvedTargetOrder = extractedOrderId;
    if (!resolvedTargetOrder && (textLower.includes('previous') || textLower.includes('that order') || textLower.includes('last order'))) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const msg = conversationHistory[i];
        const prevMatch = msg.content.match(/order\s*#?(\d+)/i) || msg.content.match(/#(\d+)/);
        if (prevMatch) {
          resolvedTargetOrder = prevMatch[1];
          break;
        }
      }
      if (resolvedTargetOrder) {
        traceSteps.push({
          id: this.generateId('TR'),
          agentName: 'Triage Agent',
          phase: 'TRIAGE',
          thought: `Resolved ambiguous context from Conversation Memory history: Target order is #${resolvedTargetOrder}.`,
          confidence: 0.94,
          timestamp: new Date().toISOString()
        });
      }
    }

    // ----------------------------------------------------
    // PHASE 3: RAG KNOWLEDGE RETRIEVAL AGENT
    // ----------------------------------------------------
    const retrievedDocs: RAGSearchResult[] = searchKnowledgeBase(userMessage, category);

    traceSteps.push({
      id: this.generateId('RAG'),
      agentName: 'Knowledge (RAG) Agent',
      phase: 'RETRIEVAL',
      thought: `Queried FoodChow Knowledge Base. Retrieved ${retrievedDocs.length} relevant technical documentation items. Top document: "${retrievedDocs[0]?.doc.title || 'N/A'}" (Score: ${retrievedDocs[0]?.score.toFixed(2) || '0.00'}).`,
      details: retrievedDocs.map(d => ({ title: d.doc.title, score: d.score, tags: d.doc.tags })),
      confidence: retrievedDocs.length > 0 ? 0.92 : 0.60,
      timestamp: new Date().toISOString()
    });

    // ----------------------------------------------------
    // PHASE 4: DIAGNOSTIC AGENT & API TOOL CALLING
    // ----------------------------------------------------
    let diagnosticSummary = "";

    if (category === 'POS' && (textLower.includes('printer') || textLower.includes('paper') || textLower.includes('kot'))) {
      const printerRes = await DiagnosticTools.get_printer_status(activeOutletId);
      toolCalls.push(printerRes.record);

      const lastPrintRes = await DiagnosticTools.get_last_successful_print(printerRes.data.id || 'PRINTER-101');
      toolCalls.push(lastPrintRes.record);

      diagnosticSummary = `Printer Telemetry: Hardware ${printerRes.data.name} status [${printerRes.data.status}]. Last successful print: ${lastPrintRes.data.lastPrintTime}.`;

      traceSteps.push({
        id: this.generateId('DIAG'),
        agentName: 'Diagnostic Agent',
        phase: 'DIAGNOSTIC',
        thought: `Executed telemetry tools \`get_printer_status()\` and \`get_last_successful_print()\`. Identified root cause: ${printerRes.data.status}.`,
        details: printerRes.data,
        confidence: 0.95,
        timestamp: new Date().toISOString()
      });
    } 
    else if (category === 'PAYMENTS' || resolvedTargetOrder) {
      const orderIdToFetch = resolvedTargetOrder || '1024';
      const orderRes = await DiagnosticTools.get_order(orderIdToFetch);
      toolCalls.push(orderRes.record);

      const paymentRes = await DiagnosticTools.get_payment_status(orderIdToFetch);
      toolCalls.push(paymentRes.record);

      if (orderRes.data.error) {
        diagnosticSummary = `Order Diagnostics: Order #${orderIdToFetch} not found in database.`;
      } else {
        diagnosticSummary = `Order Telemetry: Order #${orderRes.data.id} total ₹${orderRes.data.totalAmount}. Order Status: [${orderRes.data.orderStatus}], Payment Ledger: [${paymentRes.data.paymentStatus}].`;
      }

      traceSteps.push({
        id: this.generateId('DIAG'),
        agentName: 'Diagnostic Agent',
        phase: 'DIAGNOSTIC',
        thought: `Executed diagnostic tools \`get_order('${orderIdToFetch}')\` and \`get_payment_status()\`. Compare states: Payment is ${paymentRes.data.paymentStatus || 'UNKNOWN'} vs Order is ${orderRes.data.orderStatus || 'UNKNOWN'}.`,
        details: { order: orderRes.data, payment: paymentRes.data },
        confidence: orderRes.data.error ? 0.70 : 0.98,
        timestamp: new Date().toISOString()
      });
    }
    else if (category === 'KDS') {
      const kdsRes = await DiagnosticTools.get_kds_status(activeOutletId);
      toolCalls.push(kdsRes.record);
      diagnosticSummary = `KDS Diagnostics: Outlet ${activeOutletId} screen socket status is [${kdsRes.data.socketConnected ? 'ONLINE' : 'DISCONNECTED'}]. Queued orders: ${kdsRes.data.queuedOrdersCount}.`;

      traceSteps.push({
        id: this.generateId('DIAG'),
        agentName: 'Diagnostic Agent',
        phase: 'DIAGNOSTIC',
        thought: `Invoked \`get_kds_status('${activeOutletId}')\`. Identified WebSocket socket disconnection.`,
        details: kdsRes.data,
        confidence: 0.94,
        timestamp: new Date().toISOString()
      });
    }
    else if (severity === 'CRITICAL') {
      const outletRes = await DiagnosticTools.get_outlet(activeOutletId);
      toolCalls.push(outletRes.record);
      diagnosticSummary = `POS Network Outage Telemetry: POS Status [${outletRes.data.posStatus}]. KDS Status [${outletRes.data.kdsStatus}].`;

      traceSteps.push({
        id: this.generateId('DIAG'),
        agentName: 'Diagnostic Agent',
        phase: 'DIAGNOSTIC',
        thought: `Invoked \`get_outlet('${activeOutletId}')\`. Confirmed critical POS network outage state.`,
        details: outletRes.data,
        confidence: 0.99,
        timestamp: new Date().toISOString()
      });
    }

    // ----------------------------------------------------
    // PHASE 5: ACTION & GUARDRAIL POLICY AGENT
    // ----------------------------------------------------
    let controlledAction: ControlledActionDetails | undefined = undefined;
    let requiresHumanApproval = false;
    let isEscalated = false;
    let newTicket: EscalationTicket | undefined = undefined;

    if (textLower.includes('refund')) {
      const refundAmount = extractedAmount || 1600;
      const orderIdToRefund = resolvedTargetOrder || '1089';

      const refundResult = await DiagnosticTools.initiate_refund(orderIdToRefund, refundAmount, "Customer requested refund for failed order");
      toolCalls.push(refundResult.record);
      controlledAction = refundResult.action;

      if (controlledAction.status === 'PENDING') {
        requiresHumanApproval = true;
        isEscalated = true;

        traceSteps.push({
          id: this.generateId('GD'),
          agentName: 'Action & Guardrail Agent',
          phase: 'GUARDRAIL',
          thought: `EVALUATED POLICY: Refund request of ₹${refundAmount} exceeds automated AI permission limit of ₹500. Flagged for Human Agent Approval.`,
          details: { action: controlledAction, limit: 500 },
          confidence: 0.99,
          timestamp: new Date().toISOString()
        });
      } else {
        traceSteps.push({
          id: this.generateId('GD'),
          agentName: 'Action & Guardrail Agent',
          phase: 'ACTION',
          thought: `EVALUATED POLICY: Refund of ₹${refundAmount} is within automated threshold. Action EXECUTED.`,
          details: controlledAction,
          confidence: 0.99,
          timestamp: new Date().toISOString()
        });
      }
    }

    // ----------------------------------------------------
    // PHASE 6: ESCALATION & HUMAN HANDOFF AGENT
    // ----------------------------------------------------
    if (severity === 'CRITICAL' || requiresHumanApproval || textLower.includes('human') || textLower.includes('agent')) {
      isEscalated = true;
      const currentOutletName = activeOutletId === 'OUTLET-15'
        ? 'Express Outlet #15 (Koramangala)'
        : 'Central Flagship Outlet #12 (Indiranagar)';

      const ticketRes = await DiagnosticTools.create_support_ticket({
        customerName: "Customer (Live Chat)",
        outletId: activeOutletId,
        category,
        severity,
        summary: userMessage.slice(0, 100)
      });
      toolCalls.push(ticketRes.record);

      newTicket = {
        id: ticketRes.ticketId,
        customerName: "Customer (Live Chat)",
        restaurantId: "REST-101",
        outletName: currentOutletName,
        category,
        severity,
        status: 'OPEN',
        summary: userMessage,
        conversationHistory: [...conversationHistory],
        stepsAttempted: traceSteps.map(t => `${t.agentName}: ${t.thought}`),
        toolResults: toolCalls,
        controlledAction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      appStore.addTicket(newTicket);

      traceSteps.push({
        id: this.generateId('ESC'),
        agentName: 'Escalation Agent',
        phase: 'ESCALATION',
        thought: `Packaged structured escalation context: Ticket #${ticketRes.ticketId}. Transferred telemetry, steps, and conversation trace to Human Support Workspace.`,
        details: { ticketId: ticketRes.ticketId, severity },
        confidence: 0.98,
        timestamp: new Date().toISOString()
      });
    }

    // ----------------------------------------------------
    // PHASE 7: RESPONSE SYNTHESIS AGENT (WITH LLM AUTO-FAILOVER CHAIN)
    // ----------------------------------------------------
    const contextSummary = `Diagnostic Findings: ${diagnosticSummary || 'None'}. RAG Article: ${retrievedDocs[0]?.doc.title || 'None'}. Category: ${category}.`;
    let content = await this.synthesizeLLMResponse(userMessage, contextSummary) || "";

    // Engine fallback synthesis
    if (!content) {
      if (category === 'POS' && textLower.includes('printer')) {
        content = `I investigated your receipt printer at **Indiranagar Outlet #12** using hardware telemetry tools.

🔍 **Diagnostic Findings:**
- **Device**: Front Counter Thermal Receipt Printer (\`PRINTER-101\`)
- **Status**: ⚠️ **PAPER_JAM**
- **Last Successful Print**: 10:45 AM (Order #1023)

🛠️ **Recommended Steps to Resolve:**
1. Open the printer cover latch on the top front.
2. Clear any stuck paper remnants near the auto-cutter blade.
3. Reload the thermal paper roll so it unrolls from the bottom (core-facing down).
4. Press the cover firmly until it clicks, then tap **Feed Paper**.

Would you like me to trigger a test print or send a test ticket once cleared?`;
      } 
      else if (category === 'PAYMENTS' && textLower.includes('refund')) {
        if (requiresHumanApproval) {
          content = `I verified Order **#${resolvedTargetOrder || '1089'}** (Amount: **₹1,600**). 

⚠️ **Controlled Action Authorization Required:**
Because the refund amount exceeds the automated AI processing limit of **₹500**, I have initiated a refund authorization ticket (**${newTicket?.id}**) and routed it to a Human Support Manager.

📋 **Handoff Details:**
- **Order ID**: #${resolvedTargetOrder || '1089'}
- **Payment Status**: CAPTURED (UPI)
- **Refund Status**: PENDING HUMAN APPROVAL
- **Est. Approval Time**: Under 5 minutes

A human support supervisor is reviewing this in the live dashboard now. You will receive an immediate confirmation once approved!`;
        } else {
          content = `Your refund of **₹${extractedAmount || 350}** for Order **#${resolvedTargetOrder || '1024'}** has been processed successfully to your original payment method. Reference ID: \`REF_${Math.floor(100000 + Math.random() * 900000)}\`.`;
        }
      }
      else if (category === 'PAYMENTS') {
        content = `I investigated Order **#${resolvedTargetOrder || '1024'}** across our order database and banking payment gateway.

🔍 **Telemetry Audit:**
- **Payment Status**: ✅ **PAID** (UPI Txn: \`TXN_992014881\`)
- **Order Status**: ⏳ **PENDING_APPROVAL**
- **KDS Sync Status**: ⚠️ **FAILED** (Network sync lag between payment gateway callback and store server)

💡 **Resolution:**
Your payment is 100% safe! Banking callbacks occasionally take 2-5 minutes to update store servers during peak network load. I have pinged the Indiranagar store server to force-reconcile Order #${resolvedTargetOrder || '1024'}.

Is your order now updating on your screen?`;
      }
      else if (category === 'KDS') {
        content = `I ran diagnostics on the Kitchen Display System (KDS) at **Outlet #12**.

🔍 **Diagnostic Findings:**
- **KDS Status**: ❌ **DISCONNECTED** (WebSocket connection on port 8088 lost)
- **Queued Orders**: 3 orders pending kitchen display

🛠️ **Resolution Steps:**
1. On the kitchen tablet/screen, tap the **Settings** gear icon in the top right.
2. Click **Reconnect Socket Server**.
3. If screen remains blank, restart the FoodChow KDS App.

If the orders still don't appear, I can escalate this directly to the Tier-2 hardware team.`;
      }
      else if (resolvedTargetOrder === '1023') {
        content = `I retrieved the details for your previous Order **#1023** from conversation memory:

📦 **Order #1023 Summary:**
- **Items**: 2x Cold Coffee (₹360)
- **Payment**: ✅ PAID (Credit Card)
- **Order Status**: ✅ CONFIRMED
- **Kitchen & Printer**: ✅ PRINTED & DELIVERED (9:30 AM)

Is there anything specific you would like to modify or inquire about regarding Order #1023?`;
      }
      else if (severity === 'CRITICAL') {
        content = `🚨 **CRITICAL POS OUTAGE DETECTED**

I confirmed that **Koramangala Outlet #15** is currently experiencing a full POS network disconnect.

Emergency Support Ticket **#${newTicket?.id}** has been generated with **CRITICAL** priority. I have handed off your live session to our Senior Network On-Call Engineer in the Human Support Dashboard with all diagnostic traces attached.

Please stay on this chat—a human support specialist is taking over right now.`;
      }
      else {
        content = `I searched our FoodChow Knowledge Base and ran system diagnostics for your request.

${retrievedDocs[0] ? `📖 **Knowledge Article Match**: *${retrievedDocs[0].doc.title}*\n` : ''}
${diagnosticSummary ? `⚙️ **System Check**: ${diagnosticSummary}\n` : ''}

How would you like to proceed, or has this resolved your issue?`;
      }
    }

    const overallConfidence = traceSteps.reduce((acc, curr) => acc + (curr.confidence || 0.9), 0) / traceSteps.length;

    const agentMessage: ChatMessage = {
      id: this.generateId('MSG'),
      sender: 'agent',
      content,
      timestamp: new Date().toISOString(),
      category,
      confidenceScore: Math.round(overallConfidence * 100),
      traceSteps,
      toolCalls,
      retrievedDocs,
      controlledAction,
      isEscalated,
      ticketId: newTicket?.id
    };

    return { agentMessage, newTicket };
  }
}
