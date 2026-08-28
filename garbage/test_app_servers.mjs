import http from 'http';

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, bodySnippet: data.slice(0, 200) });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function verifyServers() {
  console.log('--- Checking Backend API ---');
  try {
    const backendRes = await checkUrl('http://localhost:5000/api/health');
    console.log('Backend /api/health:', backendRes.statusCode, backendRes.bodySnippet);
  } catch (e) {
    console.error('Backend check failed:', e.message);
  }

  console.log('\n--- Checking Frontend Dev Server ---');
  try {
    const frontendRes = await checkUrl('http://localhost:5173');
    console.log('Frontend http://localhost:5173:', frontendRes.statusCode, frontendRes.bodySnippet);
  } catch (e) {
    console.error('Frontend check failed:', e.message);
  }
}

verifyServers();
