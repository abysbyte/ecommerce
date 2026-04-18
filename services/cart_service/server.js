require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'Cart Service UP' }));

const PORT = process.env.PORT_CART || 3003;
app.listen(PORT, () => console.log(`Cart Service running on port ${PORT}`));
