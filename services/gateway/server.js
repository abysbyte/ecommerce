require('dotenv').config({ path: '../../.env' });
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Auth & User Service
app.use('/api/users', createProxyMiddleware({ target: `http://localhost:${process.env.PORT_USER || 3001}`, changeOrigin: true }));

// Product Service
app.use('/api/products', createProxyMiddleware({ target: `http://localhost:${process.env.PORT_PRODUCT || 3002}`, changeOrigin: true }));

// Cart Service
app.use('/api/cart', createProxyMiddleware({ target: `http://localhost:${process.env.PORT_CART || 3003}`, changeOrigin: true }));

// Order Service
app.use('/api/orders', createProxyMiddleware({ target: `http://localhost:${process.env.PORT_ORDER || 3004}`, changeOrigin: true }));

// Payment Service
app.use('/api/payments', createProxyMiddleware({ target: `http://localhost:${process.env.PORT_PAYMENT || 3005}`, changeOrigin: true }));

const PORT = process.env.PORT_GATEWAY || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
