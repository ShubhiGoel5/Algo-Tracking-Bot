// api/ai-proxy.js
// Server-side OpenRouter AI proxy handler
// Keeps API keys on the server, validates input, applies rate limits, and uses controlled AI models.

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;
const ipRequestCounts = new Map();

// Periodic cleanup of rate limit tracking
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      ipRequestCounts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

function isRateLimited(clientIp) {
  const now = Date.now();
  const record = ipRequestCounts.get(clientIp);
  if (!record) {
    ipRequestCounts.set(clientIp, { count: 1, startTime: now });
    return false;
  }
  if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    ipRequestCounts.set(clientIp, { count: 1, startTime: now });
    return false;
  }
  record.count++;
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  return false;
}

function getClientIp(event) {
  const forwarded = event.headers?.['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return event.headers?.['x-real-ip'] || 'client';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(event), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return respond(event, 405, { error: 'Method not allowed' });
  }

  // Rate limit check
  const clientIp = getClientIp(event);
  if (isRateLimited(clientIp)) {
    return respond(event, 429, { error: 'Rate limit exceeded. Please wait a minute before making more AI requests.' });
  }

  // Check OpenRouter API key
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return respond(event, 401, {
      error: 'AI service is not configured. Set OPENROUTER_API_KEY environment variable on the server.',
    });
  }

  // Validate payload
  let bodyData;
  try {
    if (!event.body) {
      return respond(event, 400, { error: 'Invalid request: Empty body' });
    }
    if (event.body.length > 64 * 1024) {
      return respond(event, 400, { error: 'Invalid request: Request body too large' });
    }
    bodyData = JSON.parse(event.body);
  } catch (err) {
    return respond(event, 400, { error: 'Invalid request: Malformed JSON' });
  }

  const { messages, systemPrompt } = bodyData;

  if (!Array.isArray(messages) || messages.length === 0) {
    return respond(event, 400, { error: 'Invalid request: "messages" must be a non-empty array' });
  }

  if (messages.length > 30) {
    return respond(event, 400, { error: 'Invalid request: Message history limit exceeded (max 30)' });
  }

  const validRoles = new Set(['user', 'assistant', 'system']);
  const sanitizedMessages = [];

  if (systemPrompt && typeof systemPrompt === 'string') {
    sanitizedMessages.push({
      role: 'system',
      content: systemPrompt.slice(0, 4000),
    });
  }

  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return respond(event, 400, { error: 'Invalid request: Message items must be objects' });
    }
    if (!validRoles.has(msg.role)) {
      return respond(event, 400, { error: `Invalid request: Unsupported role "${msg.role}"` });
    }
    if (typeof msg.content !== 'string') {
      return respond(event, 400, { error: 'Invalid request: Message content must be text' });
    }
    sanitizedMessages.push({
      role: msg.role,
      content: msg.content.slice(0, 8000),
    });
  }

  // Server-controlled AI model specification
  const targetModel = process.env.AI_MODEL || 'openrouter/free';
  const refererUrl = process.env.APP_URL || '';

  try {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': refererUrl,
        'X-Title': 'RupeeTracker',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: sanitizedMessages,
      }),
    });

    const responseText = await openRouterResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { raw: responseText };
    }

    if (!openRouterResponse.ok) {
      console.error('[ai-proxy] OpenRouter API error status:', openRouterResponse.status, data);
      if (openRouterResponse.status === 401) {
        return respond(event, 401, { error: 'Invalid OpenRouter API Key configuration on server.' });
      }
      if (openRouterResponse.status === 429) {
        return respond(event, 429, { error: 'OpenRouter rate limit reached for free tier models. Please try again later.' });
      }
      if (openRouterResponse.status >= 500) {
        return respond(event, 503, { error: 'OpenRouter service is currently unavailable. Please try again later.' });
      }
      return respond(event, openRouterResponse.status, {
        error: data.error?.message || `AI service error (${openRouterResponse.status})`,
      });
    }

    const replyContent = data.choices?.[0]?.message?.content || '';
    return respond(event, 200, {
      choices: [
        {
          message: {
            role: 'assistant',
            content: replyContent,
          },
        },
      ],
      model: data.model || targetModel,
      usage: data.usage || null,
    });
  } catch (err) {
    console.error('[ai-proxy] Error proxying request to OpenRouter:', err.message);
    return respond(event, 503, { error: 'Failed to connect to AI service. Check network or server configuration.' });
  }
};

function corsHeaders(event) {
  const allowedOrigin = process.env.URL || process.env.APP_URL || event?.headers?.origin || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function respond(event, statusCode, body) {
  return {
    statusCode,
    headers: {
      ...corsHeaders(event),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}
