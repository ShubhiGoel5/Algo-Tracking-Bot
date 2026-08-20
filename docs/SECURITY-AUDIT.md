# RupeeTracker Security Audit Checklist

Last audited: 2026-08-20

Use this checklist for periodic security reviews and before major releases.

---

## 1. Exposed Secrets

| Check | Status | Notes |
|-------|--------|-------|
| No hardcoded API keys in source | ✅ Fixed | OpenRouter API Key stored strictly in server env vars (`OPENROUTER_API_KEY`) |
| No tokens/passwords in committed files | ✅ OK | Verified — no secrets in tracked files |
| `.gitignore` blocks `.env`, `node_modules/` | ✅ Added | Prevents accidental secret commits |
| Supabase anon key in source | ⚠️ Accepted | Anon key is designed to be public; security relies on RLS policies |
| AI API keys in localStorage | ✅ Fixed | AI requests now pass through server-side OpenRouter proxy (`/api/ai`). Key is stored only as a server environment variable. |

---

## 2. XSS (Cross-Site Scripting)

| Check | Status | Notes |
|-------|--------|-------|
| AI chat responses HTML-escaped before `innerHTML` | ✅ Fixed | `addChatMessage()` escapes `<`, `>`, `&`, `"` before rendering |
| `markdownToHTML()` escapes HTML entities | ✅ OK | `&`, `<`, `>` escaped before markdown transforms |
| Budget item labels escaped in `renderBudgetList()` | ✅ Fixed | `escHTML(item.label)` prevents injection |
| Gmail transaction fields escaped in table render | ✅ Fixed | `escHTML()` on merchant, date, category fields |

---

## 3. CORS & Origin Validation

| Check | Status | Notes |
|-------|--------|-------|
| `ai-proxy.js` — CORS restricted to origin/URL | ✅ OK | Only allows configured application domain origin |
| `broker-proxy.js` — CORS restricted to origin/URL | ✅ OK | Only allows configured application domain origin |
| `broker-auth.js` — CORS restricted to origin/URL | ✅ OK | Same pattern as broker-proxy |

---

## 4. API & Endpoint Security

| Check | Status | Notes |
|-------|--------|-------|
| `/api/ai` validates request body structure & roles | ✅ Fixed | Validates `messages` array, roles (`user`, `assistant`, `system`), caps message size |
| `/api/ai` server-side rate limiting | ✅ Added | Applies in-memory rate limiting per client IP to prevent abuse |
| Error responses don't leak internal details | ✅ Fixed | Handlers return generic errors; details logged server-side only |
| Broker handlers validate required params | ✅ OK | All endpoints check for required fields before processing |

---

## 5. Content Security Policy (CSP)

| Check | Status | Notes |
|-------|--------|-------|
| CSP header set in `server.js` | ✅ Added | Restricts script sources, connect targets, frame sources |
| `connect-src` whitelist covers necessary APIs | ✅ OK | Supabase, MFAPI, Gold API, Finnhub, Gmail, Yahoo Finance, Overpass API (LLM connections routed via `/api/ai`) |
| `img-src` allows OSM tiles | ✅ OK | `*.tile.openstreetmap.org` for Leaflet map rendering |
| `frame-src` restricted to Google (OAuth) | ✅ OK | Only `accounts.google.com` allowed |

---

## 6. Railway Deployment & Server Setup

| Check | Status | Notes |
|-------|--------|-------|
| `server.js` uses zero external dependencies | ✅ OK | Only `node:http`, `node:fs`, `node:path` — no supply chain risk |
| Secrets stored via environment variables | ✅ OK | `OPENROUTER_API_KEY`, `AI_MODEL`, broker secrets set on server |
| Path traversal protection | ✅ OK | `server.js` resolves paths and checks they stay within directory |
| Security headers set in `server.js` | ✅ OK | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
