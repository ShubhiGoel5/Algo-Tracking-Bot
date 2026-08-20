# ₹ RupeeTracker — Complete Indian Portfolio Tracker

**Self-hosted, single-file, privacy-first portfolio tracker for Indian investors.**

Track Stocks, Mutual Funds, FDs, RDs, SGB Gold, Physical Gold, Post Office schemes, Retirement (EPF/NPS), Real Estate, Insurance, Loans, Company Share Plans (ESPP/RSU/ESOP), and more — all from one dashboard with AI-powered insights via OpenRouter. Auto-track expenses from bank emails via Gmail API.

> **Self-hosted means YOU own it.** Fork this repo. Run it locally or deploy to Railway. Cloud backup goes to your own Supabase instance. All data stays in your browser by default — no shared servers, no tracking, no accounts.

---

## Why RupeeTracker?

| Problem | RupeeTracker Solution |
|---------|-------------------|
| Groww/Zerodha only show what you buy through them | Tracks ALL assets — broker, manual, physical |
| INDMoney wants your bank login | Zero server-side user data storage — 100% browser localStorage |
| No app tracks physical gold in your bank locker | Physical gold tracker with storage locations + photo links |
| No tracker covers EPF, NPS, or real estate | Retirement + Real Estate pages with projections and AI analysis |
| Can't see FDs, SGB, PPF, and stocks in one view | Unified dashboard with allocation donut + net worth (10 asset classes) |
| Generic "AI insights" from blog articles | AI assistant trained on YOUR actual portfolio data |
| No single view of insurance + loan dues | Reminders Hub auto-tracks premiums, EMIs, maturities, SIP dates |
| Complex multi-provider key management | Single server-side OpenRouter proxy (`openrouter/free`) |
| Tied to one platform | Single HTML frontend + Node.js backend — fork it, modify it, it's yours |

---

## Architecture

```text
┌──────────────────────────────────────┐
│              USER                    │
│                                      │
│             Browser                  │
│                                      │
│           RupeeTracker App           │
│         HTML + CSS + JS              │
└───────────────┬──────────────────────┘
                │
                │ API requests
                ▼
┌──────────────────────────────────────┐
│      Node.js Server (Railway)        │
│                                      │
│  ┌────────────┐   ┌────────────────┐ │
│  │ Broker API │   │ OpenRouter API │ │
│  │ Auth/Proxy │   │ AI Proxy       │ │
│  └────────────┘   └────────────────┘ │
└───────────────┬──────────────────────┘
                │
        ┌───────┴─────────┐
        ▼                 ▼
 HDFC Securities      OpenRouter
                          │
                    Free AI models
```

---

## Features

### Dashboard & Overview
- Real-time net worth calculation across all asset classes
- Allocation donut chart with diversification score
- Source badges: BROKER (auto-fetched) / MANUAL (user-entered)
- Dark / Light theme toggle
- Responsive layout

### Asset Trackers

| Asset Class | Features |
|------------|----------|
| **Stocks** | Auto-fetched from broker, live price via Finnhub |
| **Mutual Funds** | Broker-synced + manual entry, live NAV from AMFI, fund discovery with curated picks, custom fund entry with ISIN |
| **Fixed Deposits** | Multiple banks, maturity countdown, interest calc, bank name field |
| **Recurring Deposits** | Monthly tracking, maturity projection, multi-bank |
| **SGB Gold** | Tranche-based, live gold price (international spot → INR), 2.5% annual interest calc |
| **Physical Gold** | Jewellery/coins/bars with weight, purity (14K-24K), storage location (bank locker/home/worn daily), photo links |
| **Post Office** | PPF, SSY, NSC, MIS — with maturity and interest tracking |
| **Retirement** | EPF, VPF, NPS — monthly contribution tracking, employer match, compound growth projection |
| **Real Estate** | Plot/Flat/House/Commercial/Farmland — purchase price, current value, CAGR, Leaflet map with OpenStreetMap, AI geospatial analysis |
| **Company Shares** | ESPP/ShareSave, RSU, ESOP, Bonus — configurable dividends (USD/INR/GBP/EUR), vesting schedules |
| **Insurance** | Term Life, Endowment, ULIP, Money Back, Health, Whole Life — premium tracking, renewal alerts, nominee info |
| **Loans** | Home, Car, Education, Personal, Gold, LAP, Credit Card — EMI tracking, outstanding balance, prepayment calculator |
| **Budget** | Income/expense tracking with 5 sub-tabs (Overview, Transactions, Savings, Planning, Trends), Gmail expense sync |

### Broker Integration
- **HDFC Securities** — OAuth login, auto-fetch demat holdings
- Holdings auto-classified: Stocks vs MF vs SGB vs ETF
- API keys stored server-side only (Railway environment variables)
- Token in sessionStorage (clears on tab close)
- Note: Deployment on Railway should be verified against HDFC Securities outbound IP-whitelisting requirements.

### Gmail Expense Tracking
- **Auto-sync** bank transaction emails from HDFC Bank (InstaAlerts)
- Supports 3 email types: Bank A/c debits, UPI transactions, Credit Card charges
- **LLM-powered parsing** — AI extracts merchant, amount, date, payment method, and auto-categorizes
- Date range picker for selective sync (no full inbox scan)
- **Donut pie chart** with category-wise expense breakdown
- Category and payment method **filter dropdowns**
- **Budget vs Actual** comparison — planned budget vs real spending
- Deduplication by Gmail message ID
- Requires: Google Cloud OAuth Client ID with Gmail readonly scope

### Supabase Cloud Backup
- Optional sign-up/login with email + password (Supabase Auth)
- Anonymous passphrase-based sync for no-account usage
- Auto-syncs on every portfolio change (3s debounce)
- Manual Push/Pull buttons
- Row Level Security (RLS) enforced
- All data including Gmail transactions synced

### AI Finance Assistant (✨ floating bubble)

Available on every page with 7 one-click analyses + free-text chat:

| Module | What It Does |
|--------|-------------|
| 📊 Portfolio Review | Analyses all holdings, gives verdicts, allocation advice |
| 📈 Market Mood | Nifty PE, FII/DII flows, VIX, sector trends, mood score |
| 💰 Lumpsum Timing | Deploy now vs STP vs wait — based on valuations |
| 🥇 Gold & Silver | SGB outlook, gold price trend, buy/hold/reduce |
| 🏦 FD vs Debt Funds | RBI rates, best FD rates, tax efficiency comparison |
| 📋 Tax Harvesting | LTCG harvesting, 80C, NPS, old vs new regime |
| 🏠 Real Estate | Geospatial analysis with investment grade, SWOT, micro-market scores — per-property or portfolio-wide |

- **AI Geospatial Analysis** — fetches nearby infrastructure (schools, hospitals, highways, bus stops, IT parks, railway stations) from OpenStreetMap via Overpass API and grades property investment potential
- **Server AI Proxy (`/api/ai`)** — requests route securely via OpenRouter server-side proxy (`openrouter/free`). API keys stay on the server.
- Subject to OpenRouter's availability, rate limits, and free-tier policies.

### Reminders & Alerts Hub
- Auto-generated reminders from insurance premiums, loan EMIs, FD/RD maturities, SIP dates
- Custom user-defined reminders with recurring support (monthly/quarterly/yearly)
- Filter by time (Overdue, Next 30 Days, Next 90 Days) or by type (Insurance, Loan, FD, RD, SIP, Custom)

**Repository:** [https://github.com/ShubhiGoel5/Algo-Tracking-Bot](https://github.com/ShubhiGoel5/Algo-Tracking-Bot)  
**Maintainer:** Shubhi Goel (`ShubhiGoel5`)  
**License:** [MIT License](LICENSE)

---

## Deployment & Setup Guide

### Option A: Run Locally (No Broker)

```bash
git clone https://github.com/ShubhiGoel5/Algo-Tracking-Bot.git
cd Algo-Tracking-Bot
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY
node server.js
```

Open `http://localhost:8080` in your browser.

### Option B: Deploy to Railway (Recommended)

Railway supports deploying Node.js applications directly from GitHub or via its CLI.

1. **Push your repository to GitHub.**
2. Log in to [Railway.app](https://railway.app).
3. Create a **New Project** → **Deploy from GitHub repo**.
4. Railway will automatically detect the Node.js application (`railway.json`).
5. Configure environment variables in the Railway Dashboard:

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
AI_MODEL=openrouter/free
PORT=8080
APP_URL=https://your-app.up.railway.app
HDFC_API_KEY=your_key
HDFC_API_SECRET=your_secret
```

---

## Project Structure

```text
myFinance/
├── index.html                    # Single-page web app frontend
├── server.js                     # Zero-dependency Node.js server
├── railway.json                  # Railway deployment configuration
├── package.json                  # Node.js project manifest
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore file
├── README.md
├── COMPLIANCE.md                 # API protocol compliance documentation
├── docs/
│   ├── ARCHITECTURE.md           # Architecture flow diagrams
│   ├── PRIVACY-POLICY.md         # Privacy policy
│   ├── TERMS-OF-SERVICE.md       # Terms of service
│   ├── DATA-STORAGE-DISCLOSURE.md # Data storage transparency
│   ├── COST-ANALYSIS.md           # Cost analysis breakdown
│   ├── SECURITY-AUDIT.md          # Security checklist with verification commands
│   └── SECURITY.md                # Security policy and architecture
└── api/
    ├── ai-proxy.js               # Server-side OpenRouter AI proxy
    ├── broker-auth.js            # OAuth token exchange
    └── broker-proxy.js           # Broker API proxy
```

---

## Security

| Concern | How It's Handled |
|---------|-----------------|
| Portfolio data | 100% in browser localStorage — never sent anywhere (unless cloud sync is enabled) |
| Cloud sync | Opt-in only. Data stored in your own Supabase instance with Row Level Security. HTTPS only |
| Server API keys | `OPENROUTER_API_KEY` and broker secrets stored server-side only in environment variables |
| OAuth tokens | sessionStorage — cleared when tab closes |
| AI API proxy | Input validated, role checked, payload capped, and rate limited at `/api/ai` |
| XSS prevention | HTML-escaped before rendering via `escHTML()` |
| CORS | Restricted to configured domain origin |
| CSP | Strict Content-Security-Policy header set in `server.js` |

---

## FAQ

**Q: Is my data safe?**
All data is in your browser's localStorage by default. If you enable Cloud Sync (optional), data is stored in your own Supabase instance.

**Q: Is OpenRouter AI usage completely free?**
By default, the proxy uses `openrouter/free`, which routes requests to available free models on OpenRouter. Availability is subject to OpenRouter's rate limits and tier policies.

**Q: Can I use this without deploying anywhere?**
Yes. You can open `index.html` directly or run `node server.js` locally.

---

## License

[MIT License](LICENSE) — use it, fork it, share it. Your money, your data, your tracker.
