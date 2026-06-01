const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('open', function open() {
  console.log('Connected');
  ws.send(JSON.stringify({ type: 'join_match', mesaId: 'Mesa 1' }));
});

ws.on('message', function incoming(data) {
  console.log('Received:', data.toString().substring(0, 500));
  process.exit(0);
});

ws.on('error', console.error);

setTimeout(() => {
  console.log('Timeout. No response.');
  process.exit(1);
}, 5000);
