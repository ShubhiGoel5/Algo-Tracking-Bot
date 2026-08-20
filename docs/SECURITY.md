# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (main branch) | Yes |
| Older commits | No |

RupeeTracker is a single-branch project. Only the latest version on the `main` branch receives security updates.

---

## Reporting a Vulnerability

If you discover a security vulnerability in RupeeTracker, **please report it responsibly** rather than opening a public issue.

### How to Report

1. Contact the application developer **Shubhi Goel** directly.
2. **Do NOT** open a public issue for security vulnerabilities.

---

## Security Architecture

### Core App (Client-Side)

- All portfolio data stored in browser localStorage (client-side only)
- OAuth tokens in sessionStorage (cleared on tab close)
- API keys (OpenRouter, Broker credentials) stored server-side only in environment variables
- HTTPS enforced via HSTS headers
- Content Security Policy (CSP) restricts script and API sources (applied by `server.js`)
- CORS restricted to application's own domain
- HTML sanitization on all AI-generated and user-provided content
- No cookies, no tracking, no analytics

### Server-Side API Proxy & Deployment (Railway / Node.js)

- Zero-dependency Node.js server — minimal attack surface
- `OPENROUTER_API_KEY` stored securely in server environment variables — never exposed to client-side code
- `/api/ai` proxy features input validation, array/length limits, and server-side rate limiting to prevent endpoint abuse
- Security headers set directly by `server.js` (HSTS, CSP, X-Frame-Options, etc.)
- Path traversal protection on static file serving

### Optional Cloud Sync (Supabase)

- Opt-in only — disabled by default
- Data stored in YOUR Supabase project (you control the instance)
- Row Level Security (RLS) ensures each user can only access their own data
- Server API keys (OpenRouter API key, broker credentials) are NEVER synced to cloud
- OAuth tokens (Gmail, broker) remain in browser sessionStorage — never leave the tab
