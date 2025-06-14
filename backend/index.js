
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://usuario:contraseña@servidor:27017/?authSource=admin';
const DB_NAME = process.env.DB_NAME || 'warehouseos';

let db;

MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB:', DB_NAME);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Crear base de datos (inserta doc dummy)
app.post('/api/create-db', async (req, res) => {
  try {
    const result = await db.collection('metadata').insertOne({
      createdAt: new Date(),
      app: 'warehouseos',
      message: 'Initial database creation'
    });
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Obtener stats básicos
app.get('/api/db-stats', async (req, res) => {
  try {
    const stats = await db.stats();
    res.json({ ok: true, stats });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend API running at http://localhost:${PORT}`));
