// In-memory comments store for serverless execution
const commentsMap: Record<string, any[]> = {};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const lectureId = url.searchParams.get('lectureId') || 'default';

  if (req.method === 'GET') {
    const comments = commentsMap[lectureId] || [];
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, comments }));
    return;
  }

  if (req.method === 'POST') {
    let bodyData: any = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch {
        bodyData = {};
      }
    } else if (!bodyData) {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const raw = Buffer.concat(buffers).toString();
      try {
        bodyData = JSON.parse(raw || '{}');
      } catch {
        bodyData = {};
      }
    }

    if (!bodyData.text || !bodyData.text.trim()) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Comment cannot be blank' }));
      return;
    }

    if (!commentsMap[lectureId]) {
      commentsMap[lectureId] = [];
    }

    const newComment = {
      id: 'cm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      author: bodyData.author || 'Student',
      text: bodyData.text.trim(),
      userId: bodyData.userId || null,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
    };

    commentsMap[lectureId].unshift(newComment);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, comment: newComment, comments: commentsMap[lectureId] }));
    return;
  }

  res.statusCode = 405;
  res.end();
}
