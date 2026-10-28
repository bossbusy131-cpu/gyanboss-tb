export default async function handler(req: any, res: any) {
  // Extract params
  const url = new URL(req.url, 'http://localhost');
  const asset = url.searchParams.get('asset') || '';
  let token = url.searchParams.get('token') || '';
  const userToken = url.searchParams.get('userToken') || '';
  const org = url.searchParams.get('org') || 'kuepke';

  if (!asset) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<div style="color:#fff;background:#000;padding:20px;text-align:center;font-family:sans-serif;">Missing video asset</div>');
    return;
  }

  // Try fetching access token from TargetBoard DigitalOcean backend if userToken provided
  if (!token && userToken) {
    try {
      const tbRes = await fetch(`https://seashell-app-3z5jp.ondigitalocean.app/api/v1/tpstreams/token/${encodeURIComponent(asset)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'Origin': 'https://targetboard.co.in',
          'Referer': 'https://targetboard.co.in/',
        },
      });
      if (tbRes.ok) {
        const tbData: any = await tbRes.json();
        if (tbData?.code) {
          token = tbData.code;
        }
      }
    } catch (err) {
      console.error('Error fetching TPStreams token in serverless proxy', err);
    }
  }

  const targetUrl = token
    ? `https://app.tpstreams.com/embed/${org}/${encodeURIComponent(asset)}/?access_token=${encodeURIComponent(token)}`
    : `https://app.tpstreams.com/embed/${org}/${encodeURIComponent(asset)}/`;

  try {
    const fetchRes = await fetch(targetUrl, {
      headers: {
        'Referer': 'https://targetboard.co.in/',
        'Origin': 'https://targetboard.co.in',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    let html = await fetchRes.text();

    if (!fetchRes.ok || html.includes('Not Found')) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TargetBoard Lecture Player</title>
  <style>
    body {
      margin: 0;
      background: #090d16;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 16px;
      box-sizing: border-box;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 24px 20px;
      max-width: 360px;
      width: 100%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: #10b981;
      color: #042f2e;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    h3 { font-size: 16px; margin: 0 0 6px; font-weight: 700; color: #f8fafc; }
    p { font-size: 13px; color: #94a3b8; margin: 0 0 16px; line-height: 1.4; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #10b981;
      color: #022c22;
      font-weight: 700;
      font-size: 13px;
      padding: 11px 22px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s;
    }
    .btn:hover { background: #34d399; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    </div>
    <h3>TargetBoard Login Required</h3>
    <p>Please log in with your TargetBoard mobile number to watch this lecture inside the player.</p>
    <button class="btn" onclick="window.parent.postMessage('OPEN_TB_LOGIN', '*')">
      ▶ Login to Watch Lecture
    </button>
  </div>
</body>
</html>`);
      return;
    }

    const baseTag = `<base href="https://app.tpstreams.com/embed/${org}/${encodeURIComponent(asset)}/" />`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`);
    } else {
      html = `<head>${baseTag}</head>` + html;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(html);
  } catch (err: any) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<div style="color:#fff;background:#000;padding:20px;text-align:center;font-family:sans-serif;">Player error: ${err.message}</div>`);
  }
}
