// api/finnhub-proxy.js
// Server-side Finnhub API proxy
// Keeps the Finnhub API key on the server — never exposed to the browser.

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // Finnhub free tier: 60 req/min
const ipRequestCounts = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) ipRequestCounts.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);

function isRateLimited(clientIp) {
  const now = Date.now();
  const record = ipRequestCounts.get(clientIp);
  if (!record) { ipRequestCounts.set(clientIp, { count: 1, startTime: now }); return false; }
  if (now - record.startTime > RATE_LIMIT_WINDOW_MS) { ipRequestCounts.set(clientIp, { count: 1, startTime: now }); return false; }
  record.count++;
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

function getClientIp(event) {
  const forwarded = event.headers?.['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return event.headers?.['x-real-ip'] || 'client';
}

// Allowed Finnhub endpoints (allowlist for security)
const ALLOWED_ENDPOINTS = new Set([
  'quote',           // /api/v1/quote?symbol=X
  'forex/rates',     // /api/v1/forex/rates?base=USD
  'stock/profile2',  // /api/v1/stock/profile2?symbol=X
  'stock/candle',    // /api/v1/stock/candle?...
]);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(event), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return respond(event, 405, { error: 'Method not allowed' });
  }

  // Rate limit
  const clientIp = getClientIp(event);
  if (isRateLimited(clientIp)) {
    return respond(event, 429, { error: 'Rate limit exceeded. Please wait before making more requests.' });
  }

  // Check Finnhub API key is configured
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return respond(event, 401, {
      error: 'Finnhub API key not configured on server. Set FINNHUB_API_KEY in Railway Variables or .env file.',
    });
  }

  // Parse request
  let bodyData;
  try {
    bodyData = JSON.parse(event.body || '{}');
  } catch (e) {
    return respond(event, 400, { error: 'Invalid JSON body' });
  }

  const { endpoint, params = {} } = bodyData;

  if (!endpoint || typeof endpoint !== 'string') {
    return respond(event, 400, { error: 'Missing required field: endpoint' });
  }

  // Security: only allow known endpoints
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return respond(event, 400, {
      error: `Endpoint not allowed: "${endpoint}". Allowed: ${[...ALLOWED_ENDPOINTS].join(', ')}`,
    });
  }

  // Build the Finnhub URL — append API key server-side
  const query = new URLSearchParams({ ...params, token: apiKey });
  const url = `https://finnhub.io/api/v1/${endpoint}?${query}`;

  try {
    console.log(`[finnhub-proxy] GET ${endpoint} params=${JSON.stringify(params)}`);
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error('[finnhub-proxy] Finnhub error:', res.status, data);
      return respond(event, res.status, { error: data.error || `Finnhub error (${res.status})` });
    }

    return respond(event, 200, data);
  } catch (err) {
    console.error('[finnhub-proxy] Network error:', err.message);
    return respond(event, 503, { error: 'Failed to reach Finnhub API. Check server network.' });
  }
};

function corsHeaders(event) {
  const allowedOrigin = process.env.APP_URL || event?.headers?.origin || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function respond(event, statusCode, body) {
  return {
    statusCode,
    headers: { ...corsHeaders(event), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
