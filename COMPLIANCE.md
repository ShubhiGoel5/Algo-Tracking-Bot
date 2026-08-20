# RupeeTracker — API Compliance & Data Protocol Documentation

Last reviewed: 2026-08-20

This document certifies that all third-party API integrations in RupeeTracker follow official protocols, use proper authentication flows, respect rate limits, and handle user data with minimal scope and explicit consent.

---

## 1. Gmail API (Google)

**Purpose:** Auto-track bank transaction expenses from user's own email inbox.

| Parameter | Implementation |
|-----------|---------------|
| Auth protocol | OAuth 2.0 implicit grant via Google Identity Services (GIS) |
| Library | `https://accounts.google.com/gsi/client` |
| Scope requested | `https://www.googleapis.com/auth/gmail.readonly` |
| Scope justification | Read-only access to search and fetch bank alert emails. App never modifies, deletes, or sends emails |
| Token storage | `sessionStorage` only — cleared on tab close, 1-hour expiry |
| Data extracted | Transaction metadata only: merchant name, amount, date, payment method, category |

---

## 2. OpenRouter AI Proxy

**Purpose:** Portfolio analysis, market insights, and bank email transaction parsing via `openrouter/free`.

| Parameter | Implementation |
|-----------|---------------|
| Endpoint | `/api/ai` (Node.js Server Proxy) |
| Server key | `OPENROUTER_API_KEY` stored strictly in server environment variables (e.g. Railway) |
| Rate limiting | Applied server-side in `/api/ai` per client IP |
| Payload limits | Input validation on `messages` array structure, message count (max 30), and message length |

---

## 3. HDFC Securities Broker API

**Purpose:** Fetch user's demat holdings (stocks, MFs, SGBs, ETFs) from their brokerage account.

| Parameter | Implementation |
|-----------|---------------|
| Auth protocol | OAuth 2.0 authorization code flow with server-side token exchange |
| Client credentials | `HDFC_API_KEY` and `HDFC_API_SECRET` stored in Railway environment variables |
| Token exchange | Performed server-side via `api/broker-auth.js` |
| API proxy | All requests routed through `api/broker-proxy.js` to keep API key server-side |
