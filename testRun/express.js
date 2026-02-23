// server.js
const express = require('express');
const app = express();

let count =0;

app.get('/', (req, res) => {
    count++;
    res.send('This server has handled ' + count + ' requests');
});

app.get('/api/time', (req, res) => {
    res.json({ now: new Date().toISOString() });
});

app.listen(3000, () => {
    console.log('Listening on http://localhost:3000');
});