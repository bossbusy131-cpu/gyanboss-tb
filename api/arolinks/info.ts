export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({
    success: true,
    durationHours: 24,
    service: 'Arolinks',
    status: 'active'
  }));
}
