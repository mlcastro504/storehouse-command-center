const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const jwt =require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://usuario:contraseña@servidor:27017/?authSource=admin';
const DB_NAME = process.env.DB_NAME || 'warehouseos';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1);
}

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

// ========== AUTHENTICATION ENDPOINTS ==========

// Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      role: 'operator', // Default role
      isActive: true, // Default status
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await db.collection('users').insertOne(newUser);
    res.status(201).json({ ok: true, message: 'User registered successfully', userId: result.insertedId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Login a user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ ok: true, token });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get current user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } } // Exclude password from result
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    // Rename _id to id for frontend consistency
    user.id = user._id;
    delete user._id;

    res.json({ ok: true, data: user });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ========== AUTH MIDDLEWARE ==========
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ ok: false, error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ ok: false, error: 'Token is not valid' });
    }
    req.user = user;
    next();
  });
};


// ========== GENERIC CRUD ENDPOINTS (NOW PROTECTED) ==========

// GET all documents from a collection for the logged-in user
app.get('/api/:collection', authenticateToken, async (req, res) => {
  try {
    const { collection } = req.params;
    const query = { ...req.query, user_id: req.user.userId };
    if (ObjectId.isValid(query.user_id)) {
        query.user_id = new ObjectId(query.user_id);
    }
    const items = await db.collection(collection).find(query).toArray();
    res.json({ ok: true, data: items });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST a new document to a collection, associated with the user
app.post('/api/:collection', authenticateToken, async (req, res) => {
  try {
    const { collection } = req.params;
    if (collection === 'users') {
        return res.status(403).json({ ok: false, error: 'Please use /api/register to create users.' });
    }

    const newItem = req.body;
    newItem.created_at = new Date().toISOString();
    newItem.updated_at = new Date().toISOString();
    newItem.user_id = new ObjectId(req.user.userId);
    
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

// GET one document by id from a collection, checking ownership
app.get('/api/:collection/:id', authenticateToken, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
    query.user_id = new ObjectId(req.user.userId);

    const item = await db.collection(collection).findOne(query);
    if (item) {
      res.json({ ok: true, data: item });
    } else {
      res.status(404).json({ ok: false, error: `Document not found or access denied` });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT (update) a document in a collection, checking ownership
app.put('/api/:collection/:id', authenticateToken, async (req, res) => {
    try {
        const { collection, id } = req.params;
        const updates = req.body;
        delete updates._id; 
        updates.updated_at = new Date().toISOString();

        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
        query.user_id = new ObjectId(req.user.userId);
        
        const result = await db.collection(collection).updateOne(
            query,
            { $set: updates }
        );

        if (result.matchedCount === 1) {
            const updatedDoc = await db.collection(collection).findOne(query);
            res.json({ ok: true, data: updatedDoc });
        } else {
            res.status(404).json({ ok: false, error: `Document not found or access denied` });
        }
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});


// DELETE a document from a collection, checking ownership
app.delete('/api/:collection/:id', authenticateToken, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
    query.user_id = new ObjectId(req.user.userId);

    const result = await db.collection(collection).deleteOne(query);
    if (result.deletedCount === 1) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ ok: false, error: `Document not found or access denied` });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend API running at http://localhost:${PORT}`));
