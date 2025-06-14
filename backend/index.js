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

// ========== NUEVOS ENDPOINTS REST PARA ECOMMERCE CONNECTIONS ==========

// GET todas las conexiones de ecommerce
app.get('/api/ecommerce-connections', async (req, res) => {
  try {
    const connections = await db.collection('ecommerce_connections').find({}).toArray();
    res.json({ ok: true, data: connections });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST nueva conexión ecommerce
app.post('/api/ecommerce-connections', async (req, res) => {
  try {
    const newConnection = req.body;
    newConnection.created_at = new Date();
    newConnection.updated_at = new Date();
    const result = await db.collection('ecommerce_connections').insertOne(newConnection);
    res.json({ ok: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE conexión ecommerce por ID
app.delete('/api/ecommerce-connections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection('ecommerce_connections').deleteOne({ id });
    if (result.deletedCount === 1) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ ok: false, error: 'Not found' });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend API running at http://localhost:${PORT}`));
