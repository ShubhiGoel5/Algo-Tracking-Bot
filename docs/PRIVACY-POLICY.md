# Privacy Policy

**RupeeTracker — Indian Portfolio Tracker**
Last updated: 2026-08-20

---

## 1. Overview

RupeeTracker is a self-hosted, open-source portfolio tracker. This privacy policy explains what data is collected, how it is used, and where it is stored when you use the application.

**Key principle:** RupeeTracker is designed so that all your data stays under your control. There are no shared servers, no user tracking, and no analytics. Each user deploys their own instance.

---

## 2. Data Storage

| Storage Location | What's Stored | Controlled By |
|---|---|---|
| **Browser localStorage** | All portfolio data, budget, Gmail transactions | You (your browser) |
| **Browser sessionStorage** | OAuth tokens (Gmail, broker) — cleared on tab close | You (your browser) |
| **Node.js Server / Railway** | `OPENROUTER_API_KEY`, broker secrets in environment variables | You (your server deployment) |
| **Supabase (optional)** | Portfolio data backup (if cloud sync enabled) | You (your Supabase project) |

---

## 3. Third-Party Services

### 3.1 OpenRouter AI Proxy
- **When:** You use the AI assistant or sync Gmail transactions (for LLM parsing)
- **Data sent:** Portfolio context / email snippets sent via server proxy (`/api/ai`) to OpenRouter
- **Model:** Default `openrouter/free` model router
- **Security:** `OPENROUTER_API_KEY` is kept exclusively on the server and is never sent to the browser.

### 3.2 Broker API (HDFC Securities)
- **Security:** API credentials stored server-side in environment variables, never in browser.

---

## 4. Developer & Maintainer

Developed and maintained by **Shubhi Goel**.

