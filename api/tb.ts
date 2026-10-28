export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, 'http://localhost');
    let subPath = url.searchParams.get('path') || '';

    // If path was not set via query param, extract from pathname
    if (!subPath) {
      subPath = url.pathname.replace(/^\/api\/tb\/?/, '');
    }

    // Strip leading slash
    subPath = subPath.replace(/^\/+/, '');

    // Clone query params except 'path'
    const forwardParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        forwardParams.append(key, value);
      }
    });

    const queryString = forwardParams.toString() ? `?${forwardParams.toString()}` : '';
    const targetUrl = `https://seashell-app-3z5jp.ondigitalocean.app/api/v1/${subPath}${queryString}`;

    // Prepare headers for TargetBoard backend (spoofs Origin/Referer to bypass "Origin not allowed")
    const headers: Record<string, string> = {
      'Origin': 'https://targetboard.co.in',
      'Referer': 'https://targetboard.co.in/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
    };

    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    } else {
      headers['Content-Type'] = 'application/json';
    }

    // Read body for POST / PUT / PATCH
    let body: any = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (typeof req.body === 'string') {
        body = req.body;
      } else if (req.body && typeof req.body === 'object') {
        body = JSON.stringify(req.body);
      } else {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        body = Buffer.concat(buffers).toString();
      }
    }

    const tbRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body || undefined,
    });

    const resContentType = tbRes.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', resContentType);
    res.statusCode = tbRes.status;

    const data = await tbRes.text();
    res.end(data);
  } catch (err: any) {
    console.error('TargetBoard Vercel proxy error:', err);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'TargetBoard proxy connection error', error: err.message }));
  }
}
