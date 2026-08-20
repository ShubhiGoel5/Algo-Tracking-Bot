# RupeeTracker — Cost Analysis (AI + Hosting)

Last updated: 2026-08-20

## AI-Powered Features

RupeeTracker routes AI requests server-side via OpenRouter (`openrouter/free`):

1. **Gmail Expense Parsing** — LLM extracts merchant, amount, date, category from bank alert emails
2. **AI Finance Assistant** — Portfolio analysis, market mood, tax harvesting, real estate, chat

---

## 1. OpenRouter AI Model Routing (`openrouter/free`)

- **Default Model:** `openrouter/free`
- **Cost:** Subject to OpenRouter's availability, rate limits, and free-tier policies.
- OpenRouter automatically selects high-quality free models compatible with the request.
- Client error handling catches rate-limits (`429`) or provider unavailability (`503`) gracefully.

---

## 2. Hosting Cost Breakdown

| Deployment | Monthly Cost | Broker Support | Notes |
|-----------|-------------|----------------|-------|
| **Local `node server.js`** | $0 | Yes (Local) | Local Node server origin |
| **Railway** | Free Tier / Usage | Yes (Server) | Auto-builds from GitHub, environment secrets |

---

## 3. Key Design Decisions That Keep Costs Low

| Decision | Impact |
|----------|--------|
| **Email truncation (500 chars)** | Cuts input tokens by ~80% vs full email body |
| **Batch processing (15 emails/batch)** | Amortizes system prompt across 15 emails |
| **Deduplication by Gmail message ID** | Already-synced emails are never re-parsed |
| **User-initiated sync only** | AI called only when user clicks Sync |
| **Results cached in localStorage** | AI analyses cached locally — instant replay without re-running |
| **Controlled server proxy (`/api/ai`)** | Server validates payload size & applies rate limits |
