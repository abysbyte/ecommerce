require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const { PrismaClient } = require('./prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_admin_key';

// Middleware to verify JWT and admin role
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Serve static product images
app.use('/images', express.static(path.join(__dirname, 'images')));

const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.post('/api/products/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const imageUrl = `http://localhost:${process.env.PORT_PRODUCT || 3002}/images/${req.file.filename}`;
  res.json({ imageUrl });
});

app.get('/health', (req, res) => res.json({ status: 'Product Service UP' }));

// Initial Seed Logic
const seedProducts = async () => {
  try {
    const count = await prisma.product.count();
    if (count === 0) {
      console.log("Seeding initial products into the PostgreSQL database...");
      await prisma.product.createMany({
        data: [
          { name: 'Icon Carhartt beanie', brand: 'CLASSICS', price: 1999, category: 'Apparel', size: 'OS', color: 'Grey', imageUrl: 'http://localhost:3002/images/This Black & Plaid Outfit is Giving Main Character Energy 🖤✨.jpeg' },
          { name: 'Uveng Floral Strap Midi Dress Women Party Elegant Sleeveless Bodycon Casual Female Fashion Beach Dresses Holiday Clothes Summer Blue', brand: 'CLASSICS', price: 3499, category: 'Apparel', size: 'L', color: 'White', imageUrl: 'http://localhost:3002/images/Uveng Floral Strap Midi Dress Women Party Elegant Sleeveless Bodycon Casual Female Fashion Beach Dresses Holiday Clothes Summer Blue-S.jpeg' },
          { name: 'Valentine Chic', brand: 'CLASSICS', price: 1599, category: 'Apparel', size: 'M', color: 'Black', imageUrl: 'http://localhost:3002/images/Valentine Chic.jpeg' },
          { name: 'Full Black outfit', brand: 'CLASSICS', price: 1599, category: 'Apparel', size: 'M', color: 'Black', imageUrl: 'http://localhost:3002/images/black outfit.jpeg' },
          { name: 'Container Baggu tote', brand: 'CLASSICS', price: 1299, category: 'Accessories', size: 'OS', color: 'Black', imageUrl: 'http://localhost:3002/images/wine red uniform Outfit with blazer.jpeg' },
          { name: 'Container travel tumbler', brand: 'CLASSICS', price: 1499, category: 'Accessories', size: 'OS', color: 'Black', imageUrl: 'http://localhost:3002/images/Uveng Floral Strap Midi Dress Women Party Elegant Sleeveless Bodycon Casual Female Fashion Beach Dresses Holiday Clothes Summer Blue-S.jpeg' },
          { name: 'Grid Nalgene bottle', brand: 'CLASSICS', price: 999, category: 'Accessories', size: 'OS', color: 'Clear', imageUrl: 'http://localhost:3002/images/Unisex Oversized Black Faux Leather Jacket.jpeg' },
        ]
      });
    }
  } catch (error) {
    console.error("Seed error:", error);
  }
};

app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Admin API: Create a new product (Protected)
app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const { name, brand, price, category, size, color, imageUrl } = req.body;
    
    if (!name || !brand || !price || !category || !size || !color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        brand,
        price: parseFloat(price),
        category,
        size,
        color,
        imageUrl: imageUrl || null
      }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Admin API: Update an existing product by ID (Protected)
app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const { name, brand, price, category, size, color, imageUrl } = req.body;
    
    if (!name || !brand || !price || !category || !size || !color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        brand,
        price: parseFloat(price),
        category,
        size,
        color,
        imageUrl: imageUrl || null
      }
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Admin API: Delete a product by ID (Protected)
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT_PRODUCT || 3002;
app.listen(PORT, async () => {
  await seedProducts();
  console.log(`Product Service running on port ${PORT}`);
});
