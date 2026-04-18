require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'Order Service UP' }));

const PORT = process.env.PORT_ORDER || 3004;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
