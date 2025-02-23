// backend/index.js
//WE WILL NEVER EDIT HERE AGAIN

require('dotenv').config(); // to load .env
const db = require('./dbSetup');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Hello from RuCookin backend!');
});

const router = require('./routes/routesIndex');
app.use('/server', router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
