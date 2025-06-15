
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
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

// ========== GENERIC CRUD ENDPOINTS FOR ALL COLLECTIONS ==========

// GET all documents from a collection (with optional query params)
app.get('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    // Basic query support from query string, e.g., /api/pallets?status=waiting_putaway
    const query = req.query; 
    const items = await db.collection(collection).find(query).toArray();
    res.json({ ok: true, data: items });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST a new document to a collection
app.post('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const newItem = req.body;
    newItem.created_at = new Date().toISOString();
    newItem.updated_at = new Date().toISOString();
    
    // Ensure `id` is present if `_id` is not
    if (!newItem.id && !newItem._id) {
        newItem.id = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    const result = await db.collection(collection).insertOne(newItem);
    const insertedDoc = await db.collection(collection).findOne({ _id: result.insertedId });
    res.status(201).json({ ok: true, data: insertedDoc });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET one document by id from a collection
app.get('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
    const item = await db.collection(collection).findOne(query);
    if (item) {
      res.json({ ok: true, data: item });
    } else {
      res.status(404).json({ ok: false, error: `Document with id ${id} not found in ${collection}` });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT (update) a document in a collection
app.put('/api/:collection/:id', async (req, res) => {
    try {
        const { collection, id } = req.params;
        const updates = req.body;
        delete updates._id; // Do not allow updating the _id
        updates.updated_at = new Date().toISOString();

        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
        
        const result = await db.collection(collection).updateOne(
            query,
            { $set: updates }
        );

        if (result.matchedCount === 1) {
            const updatedDoc = await db.collection(collection).findOne(query);
            res.json({ ok: true, data: updatedDoc });
        } else {
            res.status(404).json({ ok: false, error: `Document with id ${id} not found for update in ${collection}` });
        }
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});


// DELETE a document from a collection
app.delete('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
    const result = await db.collection(collection).deleteOne(query);
    if (result.deletedCount === 1) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ ok: false, error: `Document with id ${id} not found for deletion in ${collection}` });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend API running at http://localhost:${PORT}`));
