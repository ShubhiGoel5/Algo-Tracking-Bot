# RupeeTracker — Architecture Flow Diagrams

## 1. Gmail Expense Parsing & AI Proxy Flow

How bank transaction emails are synced, parsed, and processed via the Node.js server proxy (`/api/ai`).

```mermaid
flowchart TD
    A["User clicks<br/><b>Sync Now</b><br/>(Budget page)"] --> B{OAuth token<br/>valid?}
    B -- No --> C["ensureGmailToken()<br/>Trigger Google OAuth popup"]
    C --> D{User<br/>authorizes?}
    D -- No --> E["Show: Connect Gmail<br/>in Settings first"]
    D -- Yes --> F["Token stored in<br/>sessionStorage<br/>(1-hour expiry)"]
    B -- Yes --> F
    F --> G{Start & End<br/>dates set?}
    G -- No --> H["Show: Select<br/>start and end dates"]
    G -- Yes --> I["Build Gmail search query"]

    I --> J["<b>GMAIL_BANK_CONFIGS.hdfc.query</b><br/>from:alerts@hdfcbank.bank.in"]

    J --> K["<b>Gmail API</b><br/>GET /gmail/v1/users/me/messages"]
    K --> L{Messages<br/>found?}
    L -- No --> M["Show: No matching<br/>emails found"]
    L -- Yes --> N["Dedup: filter out<br/>messages already in<br/>localStorage by Gmail ID"]

    N --> O{New messages<br/>exist?}
    O -- No --> P["Show: All emails<br/>already synced"]
    O -- Yes --> Q["Fetch full message bodies"]

    Q --> R["<b>Gmail API</b><br/>GET /messages/{id}?format=full"]
    R --> S["extractEmailBody()<br/>Decode payload"]

    S --> T["Collect email objects:<br/>{id, snippet, body, date}"]

    T --> U["<b>LLM Batch Parse</b>"]

    U --> V["POST <b>/api/ai</b><br/>(Node.js Server Proxy)"]

    V --> W["<b>OpenRouter API</b><br/>openrouter/free"]

    W --> X["AI returns JSON array:<br/>{merchant, amount, date, category}"]

    X --> Y["Save to<br/><b>localStorage</b><br/>mypf_gmail_transactions"]

    Y --> Z["renderGmailTransactions()"]

    style A fill:#1a1a2e,stroke:#4a9eff,color:#fff
    style J fill:#1a2e1a,stroke:#3ecf8e,color:#fff
    style K fill:#2e1a1a,stroke:#e8923a,color:#fff
    style V fill:#1a1a2e,stroke:#a78bfa,color:#fff
    style W fill:#1a2e1a,stroke:#3ecf8e,color:#fff
    style Y fill:#1a2e2e,stroke:#38bdf8,color:#fff
```

---

## 2. Deployment Architecture

How the app runs locally or deploys on Railway using Node.js.

```mermaid
flowchart TD
    subgraph Browser ["RupeeTracker App (Browser)"]
        APP["index.html<br/>Single-file app"]
        LS["localStorage<br/>All portfolio data"]
        SS["sessionStorage<br/>OAuth tokens"]
    end

    subgraph NodeServer ["Railway / Node.js Server"]
        SRV["server.js<br/>Zero-dependency Node server"]
        AI["ai-proxy.js<br/>(/api/ai OpenRouter Proxy)"]
        BA["broker-auth.js<br/>(OAuth token exchange)"]
        BP["broker-proxy.js<br/>(Broker API proxy)"]
    end

    subgraph ExternalAPIs ["External API Providers"]
        OR["OpenRouter API<br/>openrouter/free"]
        HDFC["HDFC Securities API"]
    end

    subgraph Cloud ["Cloud Backup"]
        SB["Supabase<br/>Cloud backup + RLS"]
    end

    APP -- "POST /api/ai" --> SRV
    APP -- "POST /api/broker-*" --> SRV
    SRV --> AI
    SRV --> BA
    SRV --> BP
    AI --> OR
    BA --> HDFC
    BP --> HDFC
    APP -- "Direct from browser<br/>(opt-in sync)" --> SB
```

### How `server.js` Works

The server is a zero-dependency Node.js HTTP server that routes requests to `api/` handlers:

```text
Browser → POST /api/ai          → server.js → api/ai-proxy.js
Browser → POST /api/broker-auth → server.js → api/broker-auth.js
Browser → POST /api/broker-proxy→ server.js → api/broker-proxy.js
Browser → GET /                 → serves index.html
```

---

## Key Components Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| `GMAIL_BANK_CONFIGS` | `index.html` | Bank-specific Gmail query templates |
| `syncGmailTransactions()` | `index.html` | Main sync orchestrator |
| `callAI()` | `index.html` | Sends AI prompts to `/api/ai` server proxy |
| `exports.handler` | `api/ai-proxy.js` | Server-side OpenRouter proxy handler |
| `supaUpsertAll()` | `index.html` | Push per-key data to Supabase |
