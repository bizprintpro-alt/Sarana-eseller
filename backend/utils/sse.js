/**
 * SSE (Server-Sent Events) — Real-time notification
 * Seller/Affiliate-д захиалга ирэх, статус өөрчлөгдөх мэдэгдэл
 */

const clients = new Map(); // userId -> [res, res, ...]

// Cap per user so one account can't exhaust server memory with unlimited
// SSE connections (rate-limiters don't work well on long-lived streams).
const MAX_CONNECTIONS_PER_USER = 5;

function addClient(userId, res) {
  const id = String(userId);
  const existing = clients.get(id) || [];
  if (existing.length >= MAX_CONNECTIONS_PER_USER) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Too many open connections' }));
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  if (!clients.has(id)) clients.set(id, []);
  clients.get(id).push(res);

  res.req?.on('close', () => {
    const list = clients.get(id) || [];
    clients.set(id, list.filter(r => r !== res));
    if (!clients.get(id).length) clients.delete(id);
  });
}

function sendToUser(userId, event, data) {
  const id = String(userId);
  const list = clients.get(id) || [];
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  list.forEach(res => {
    try { res.write(payload); } catch {}
  });
}

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [, list] of clients) {
    list.forEach(res => {
      try { res.write(payload); } catch {}
    });
  }
}

module.exports = { addClient, sendToUser, broadcast };
