import type { IncomingMessage, ServerResponse } from 'http';

const AROLINKS_API_KEY = 'a7616376b1ef8920d0ad9a7f6ffbb0313d8bbce7';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
    return;
  }

  try {
    let bodyData: any = req.body;

    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch {
        bodyData = {};
      }
    } else if (!bodyData) {
      // Parse stream if Vercel doesn't pre-parse body
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const rawBody = Buffer.concat(buffers).toString();
      try {
        bodyData = JSON.parse(rawBody || '{}');
      } catch {
        bodyData = {};
      }
    }

    const destinationUrl = bodyData?.destinationUrl;
    const token = bodyData?.token || ('aro_' + Date.now().toString(36));

    if (!destinationUrl) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'destinationUrl is required' }));
      return;
    }

    const apiUrl = `https://arolinks.com/api?api=${AROLINKS_API_KEY}&url=${encodeURIComponent(destinationUrl)}&format=json`;
    const response = await fetch(apiUrl);
    const json = await response.json();

    if (json && (json.status === 'success' || json.shortenedUrl)) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        shortUrl: json.shortenedUrl,
        token,
        destinationUrl
      }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: json.message || 'Arolinks API returned failure',
      raw: json
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err.message || 'Server error' }));
  }
}
