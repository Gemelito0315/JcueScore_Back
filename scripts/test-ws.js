const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('open', function open() {
  console.log('Connected, sending auth...');
  // The server might require auth before it processes anything? 
  // No, the code doesn't show it.
  console.log('Sending get_active_matches');
  ws.send(JSON.stringify({ type: 'get_active_matches' }));
});

ws.on('message', function incoming(data) {
  console.log('Received message size:', data.length);
  console.log('Content preview:', data.toString().substring(0, 100));
});

ws.on('close', function close(code, reason) {
  console.log('Disconnected', code, reason.toString());
});

ws.on('error', function err(error) {
  console.log('Error:', error);
});

setTimeout(() => {
  console.log('Timeout reached, closing');
  ws.close();
}, 3000);
