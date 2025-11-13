const express = require('express');
const app = express();
const port = 5100;

app.get('/testok', (req, res) => {
  res.send('Route is working');
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});
