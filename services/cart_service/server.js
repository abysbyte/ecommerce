require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const redisClient = redis.createClient();
redisClient.connect().catch(console.error);

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_admin_key';

// Middleware to verify JWT token from cookie

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/health', (req, res) => res.json({ status: 'Cart Service UP' }));

// Get user's cart
app.get('/', authMiddleware, async (req, res) => {
  try {
    const cartKey = `cart:${req.userId}`;
    const cartData = await redisClient.get(cartKey);
    const cart = cartData ? JSON.parse(cartData) : [];
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
app.post('/add', authMiddleware, async (req, res) => {
  try {
    const { id, name, brand, price, category, size, color, imageUrl } = req.body;
    
    if (!id || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cartKey = `cart:${req.userId}`;
    const cartData = await redisClient.get(cartKey);
    let cart = cartData ? JSON.parse(cartData) : [];

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        brand,
        price,
        category,
        size,
        color,
        imageUrl,
        quantity: 1
      });
    }

    await redisClient.set(cartKey, JSON.stringify(cart));
    res.status(201).json({ message: 'Added to cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Remove item from cart
app.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const cartKey = `cart:${req.userId}`;
    const cartData = await redisClient.get(cartKey);
    let cart = cartData ? JSON.parse(cartData) : [];

    cart = cart.filter(item => item.id !== parseInt(productId));
    await redisClient.set(cartKey, JSON.stringify(cart));
    
    res.json({ message: 'Item removed from cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Clear cart
app.delete('/', authMiddleware, async (req, res) => {
  try {
    const cartKey = `cart:${req.userId}`;
    await redisClient.del(cartKey);
    res.json({ message: 'Cart cleared', cart: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

const PORT = process.env.PORT_CART || 3003;
app.listen(PORT, () => console.log(`Cart Service running on port ${PORT}`));
