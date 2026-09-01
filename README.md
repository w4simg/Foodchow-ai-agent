# 🍔 FoodChow Agentic AI Customer Support System

> **An Agentic AI Support Engine for FoodChow POS, KDS, Online Ordering, Payments, and Restaurant Operations.**

Built for the **FoodChow AI Support Agent Interview Assignment**.

---

## 🎨 Clean & Smooth Theme Switcher
The application features a theme switcher in the top navigation bar and settings drawer:
1. **Clean Light Mode**: Crisp white slate, subtle drop shadows, and vibrant FoodChow orange accents.
2. **Soft Slate SaaS**: Balanced slate grey SaaS aesthetic.
3. **Midnight Dark**: Premium glassmorphic dark mode.

---

## 🗄️ Connecting a Real Database

You can easily connect your real database (PostgreSQL, Supabase, MongoDB, or MySQL) to the application:

1. Click **DB & API Settings** in the top navigation header.
2. Select your database type (**PostgreSQL**, **Supabase Cloud**, or **MongoDB Atlas**).
3. Paste your Connection String or API Key:
   ```text
   postgresql://postgres:password@localhost:5432/foodchow_db
   ```
4. Click **Copy SQL Schema** to get the auto-generated DDL tables for `restaurants`, `outlets`, `orders`, and `support_tickets`.

The database adapter layer is located in [`src/db/databaseAdapter.ts`](file:///c:/Users/unixb/OneDrive/Desktop/FoodChow/src/db/databaseAdapter.ts).

---

## ⚡ Extra Features Added

1. **Voice Microphone Dictation (Speech-to-Text)**:
   - Click the microphone icon in the customer chat to speak your questions directly using Web Speech API dictation.

2. **Real LLM API Key Configurator**:
   - Plug in custom OpenAI GPT-4o or Google Gemini API keys in the DB & API Settings modal.

3. **Analytics & Cost Telemetry Bar**:
   - Real-time token usage calculation, estimated LLM cost tracking ($/turn), customer sentiment indicator, and 100% guardrail policy enforcement meter.

4. **Multi-Agent Execution Trace Observability**:
   - Real-time step-by-step breakdown (Triage -> RAG -> Diagnostics -> Guardrails -> Action -> Escalation) with JSON telemetry inspection.

---

## 📍 Clarification: What is "Indiranagar Outlet"?
"Indiranagar Flagship Outlet #12" is one of the mock restaurant locations in FoodChow's system located in **Indiranagar** (a famous restaurant district in Bengaluru, India). You can select or rename outlets using the outlet dropdown in the top header bar or via the settings drawer.

---

## 🚀 Running Locally

```bash
cd FoodChow
npm install
npm run dev
```

Open `http://localhost:3000` in your web browser.
