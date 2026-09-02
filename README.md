# 🍔 FoodChow Autonomous Agentic AI Customer Support System

> **An Enterprise-Grade Multi-Agent AI Support Engine for FoodChow POS, Kitchen Display (KDS), Online Ordering, Payments, and Restaurant Outlets.**

Built for the **FoodChow AI Support Agent System**.

---

## 📐 Architecture & System Workflow Diagrams

### 1. Multi-Agent Reasoning & Execution Pipeline

```mermaid
flowchart TD
    A[Customer Prompt / Voice Dictation] --> B[Phase 0: Intent & Quote Parser]
    B --> C{Polite Chat / Casual?}
    C -- Yes --> D[Synthesize Conversational Reply]
    C -- No --> E[Phase 1: Intent Classification & Triage Agent]
    E --> F[Phase 2: RAG Knowledge Retrieval Agent]
    F --> G[Phase 3: Hardware & API Diagnostic Tool Agent]
    G --> H[Phase 4: Policy Guardrails & Permissions Agent]
    H --> I{Action Exceeds Guardrail?}
    I -- Yes e.g. Refund > ₹500 --> J[Generate Escalation Ticket for Admin]
    I -- No --> K[Phase 5: Multi-Tier LLM Synthesizer]
    J --> K
    K --> L{Primary: Groq API gpt-oss-120b}
    L -- Success --> M[Deliver Markdown Response]
    L -- Rate Limit / Error --> N{Secondary: Gemini 1.5 API}
    N -- Success --> M
    N -- Rate Limit / Error --> O[Fallback: FoodChow Local Autonomous Engine]
    O --> M
```

---

### 2. Live Human Takeover & AI Auto-Mute Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant CustomerChat as Customer Chat UI
    participant AppStore as Central AppStore (localStorage)
    participant AdminPortal as Admin Portal (/admin)
    actor Admin as Human Support Agent

    Customer->>CustomerChat: "I need human support for Order #1089"
    CustomerChat->>AppStore: Create Escalation Ticket (Status: PENDING)
    AppStore-->>AdminPortal: Real-Time Storage Event Sync
    AdminPortal->>Admin: Display Ticket in Human Handoff Queue
    Admin->>AdminPortal: Type Response & Send Message
    AdminPortal->>AppStore: Append 'human_agent' message to Ticket Log
    AppStore-->>CustomerChat: Sync Chat Log Cross-Tab
    CustomerChat->>CustomerChat: Detect Human Agent Joined -> MUTE AI AGENT
    Customer->>CustomerChat: "Thanks! Can you check my refund?"
    CustomerChat->>AppStore: Append Customer Reply directly to Ticket Log (AI Stays Muted)
    Admin->>AdminPortal: Click "Approve Refund (₹1600)"
    AdminPortal->>AppStore: Update Ticket Status: APPROVED
    AppStore-->>CustomerChat: Display "Status: APPROVED" Badge & Confirmation Message
```

---

### 3. Automatic Multi-Tier LLM Failover Chain

```mermaid
graph LR
    UserRequest[Customer Request] --> Tier1[Groq Cloud API<br>model: openai/gpt-oss-120b]
    Tier1 -- Rate Limited / 429 / Error --> Tier2[Google Gemini 1.5 Pro/Flash API<br>model: gemini-1.5-flash]
    Tier2 -- Rate Limited / Error --> Tier3[FoodChow Local Autonomous Engine<br>Instant Deterministic Synthesis]
    Tier1 -- 200 OK --> Output[Markdown Response]
    Tier2 -- 200 OK --> Output
    Tier3 -- 200 OK --> Output
```

---

## 🗄️ Where Data, API Keys, and Chat History Are Stored

### 1. API Keys & LLM Configuration Storage
All API keys and execution settings are stored locally in the browser's `localStorage`:

| Key Name | Description | Format / Example | Location in Code |
| :--- | :--- | :--- | :--- |
| `foodchow_llm_provider` | Active LLM Execution Mode (`AUTO`, `GROQ`, `GEMINI`, `LOCAL`) | `AUTO` | [`AdminPortal.tsx`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/components/AdminPortal.tsx) / [`agentEngine.ts`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/agent/agentEngine.ts) |
| `foodchow_groq_key` | Secret Groq Cloud API Key (`openai/gpt-oss-120b`) | `gsk_...` | [`AdminPortal.tsx`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/components/AdminPortal.tsx) / [`agentEngine.ts`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/agent/agentEngine.ts) |
| `foodchow_gemini_key` | Secret Google Gemini API Key | `AIzaSy...` | [`AdminPortal.tsx`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/components/AdminPortal.tsx) / [`agentEngine.ts`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/agent/agentEngine.ts) |

---

### 2. Chat History & Escalation Ticket Storage
All customer interactions, escalation tickets, and human takeover logs are stored persistently:

| Storage Location | Key / Type | Description | Relevant Files |
| :--- | :--- | :--- | :--- |
| **`localStorage`** | `foodchow_messages` | Stores array of customer chat history (`ChatMessage[]`) | [`appStore.ts`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/store/appStore.ts) |
| **`localStorage`** | `foodchow_tickets` | Stores array of human handoff tickets (`EscalationTicket[]`) | [`appStore.ts`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/store/appStore.ts) |
| **Ticket Memory** | `ticket.conversationHistory` | Complete thread history recorded per escalation ticket | [`agent.ts`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/types/agent.ts) |
| **JSON Export** | `customer_chat_history.json` | Downloadable JSON log exported from Public Customer Chat | [`jsonHistoryExporter.ts`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/utils/jsonHistoryExporter.ts) |
| **JSON Export** | `live_human_session_TCK-XXXX.json` | Downloadable JSON log exported from Admin Panel live session | [`jsonHistoryExporter.ts`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/utils/jsonHistoryExporter.ts) |

---

## 📁 Comprehensive Project Directory Structure

```text
FoodChow/
├── index.html                       # HTML Entry point
├── package.json                     # NPM Dependencies & Scripts
├── tsconfig.json                    # TypeScript Configuration
├── vite.config.ts                   # Vite Build Configuration
├── README.md                        # Documentation & Architecture Overview
└── src/
    ├── App.tsx                      # Root Application Routing & Layout Component
    ├── main.tsx                     # Vite React DOM Mounting File
    ├── index.css                    # Main CSS Design System & Responsive Styles
    ├── agent/
    │   ├── agentEngine.ts           # Core Multi-Agent Orchestrator (Phase 0 - Phase 7)
    │   └── telemetryTools.ts        # Mock Telemetry Diagnostic APIs (POS, KDS, Orders)
    ├── components/
    │   ├── AdminPortal.tsx          # Protected Management Portal (/admin)
    │   ├── CustomerChat.tsx         # Public Customer Chat Interface with Voice Dictation & Reply Toolbar
    │   ├── DocumentModal.tsx        # Article Preview Modal for RAG Documents
    │   ├── Header.tsx               # Top Header Bar with Theme Switcher & Outlet Dropdown
    │   ├── HumanDashboard.tsx       # Live Human Handoff Queue & Agent Take-Over Panel
    │   ├── PredefinedScenariosView.tsx # Eval Scenario Suite with Create, Edit, & Delete Controls
    │   └── RAGInspector.tsx         # Knowledge Base RAG Inspector with Create, Edit, & Delete Controls
    ├── data/
    │   ├── defaultKnowledgeBase.ts  # Pre-indexed RAG Articles for POS, KDS, & Payments
    │   ├── mockData.ts              # Mock Outlets, Orders, & System State Data
    │   └── predefinedScenarios.ts   # Pre-configured Evaluation Test Scenarios
    ├── db/
    │   └── databaseAdapter.ts       # Database Connection Layer (PostgreSQL, Supabase, MongoDB)
    ├── rag/
    │   └── knowledgeBase.ts         # Hybrid Vector & Keyword RAG Search Algorithm
    ├── store/
    │   └── appStore.ts              # Reactive Central Store with Cross-Tab localStorage Sync
    ├── types/
    │   └── agent.ts                 # TypeScript Interfaces (ChatMessage, EscalationTicket, RAGDoc)
    └── utils/
        ├── formatText.tsx           # Markdown Renderer (Headers, Bold, Bullet Points, Code)
        └── jsonHistoryExporter.ts   # Helper Utility for Exporting Chat & Live Session JSON Logs
```

---

## 🛡️ Admin Portal Capabilities (`/admin`)

Access the Protected Admin Console by clicking **Admin Console** or navigating to `/#/admin`:
- **Default Admin Credentials**: `ID: admin` | `Password: admin123`

### Features:
1. 🎧 **Human Handoff & Live Take-Over**:
   - Inspect incoming customer tickets in real-time.
   - Reply directly to customer chats with automatic AI stand-down/muting.
   - Approve or reject controlled AI refund requests (e.g. ₹1600 refund approval).
   - Export structured `live_human_session_TCK-XXXX.json` logs or clear queue.

2. ⚡ **Eval Scenarios & Agent Stress-Testing Suite**:
   - Test agentic reasoning flows across hardware jams, payment discrepancies, and socket failures.
   - **Full Management**: Create, Edit (`✏️`), Delete (`🗑️`), or Launch scenarios into chat.

3. 📖 **RAG Knowledge Base Inspector**:
   - Test hybrid vector search queries against technical documentation.
   - **Full Management**: Create (`➕`), Edit (`✏️`), Delete (`🗑️`), or Read (`👁️`) RAG articles.

4. 💾 **LLM Engine & Policy Guardrail Controls**:
   - Configure **Auto-Failover Mode**: Groq (`openai/gpt-oss-120b`) ➔ Gemini 1.5 ➔ Local Engine.
   - Test Groq API Key (`gsk_...`) and Gemini API Key (`AIzaSy...`) authorization & token quotas in real time.
   - Set automated refund threshold limits (Default: ₹500).

---

## 🚀 Running Locally

```bash
# 1. Clone repository & navigate to folder
cd FoodChow

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev

# 4. Build production bundle (Verification)
npm run build
```

Open `http://localhost:3000` in your web browser.
