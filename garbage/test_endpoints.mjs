import http from 'http';

async function testBackend() {
  console.log('Testing server health endpoint...');
  const req = http.get('http://localhost:5000/api/health', (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log('Health check response:', res.statusCode, JSON.parse(data));
    });
  });

  req.on('error', (err) => {
    console.error('Server request failed:', err.message);
  });
}

testBackend();
