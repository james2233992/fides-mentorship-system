const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Test Server Running!</h1><p>If you can see this, the connection works.</p>');
});

server.listen(8080, '0.0.0.0', () => {
  console.log('Test server running on http://0.0.0.0:8080');
  console.log('Also accessible at http://192.168.100.108:8080');
});