require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'Payment Service UP' }));

const PORT = process.env.PORT_PAYMENT || 3005;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
