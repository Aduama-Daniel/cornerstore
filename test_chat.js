const http = require('http');

const data = JSON.stringify({
    message: "What dresses do you have?"
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let responseData = '';
    res.on('data', chunk => {
        responseData += chunk;
    });
    res.on('end', () => {
        console.log(responseData);
    });
});

req.on('error', error => {
    console.error('Error fetching:', error);
});

req.write(data);
req.end();
