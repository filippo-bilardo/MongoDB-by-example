const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/biblioteca?authSource=admin';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Client MongoDB
let db;
let libriCollection;

// Connessione a MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connesso a MongoDB!');
    
    db = client.db('biblioteca');
    libriCollection = db.collection('libri');
    
    // Verifica numero documenti
    const count = await libriCollection.countDocuments();
    console.log(`📚 Libri nel database: ${count}`);
    
  } catch (error) {
    console.error('❌ Errore connessione MongoDB:', error);
    process.exit(1);
  }
}

// ============================================
// ROUTES - API REST
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: 'biblioteca',
    timestamp: new Date().toISOString()
  });
});

// GET /api/libri - Lista tutti i libri
app.get('/api/libri', async (req, res) => {
  try {
    const libri = await libriCollection.find().toArray();
    res.json({ 
      success: true, 
      count: libri.length,
      data: libri 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/libri/:id - Dettagli libro per ID
app.get('/api/libri/:id', async (req, res) => {
  try {
    const libro = await libriCollection.findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!libro) {
      return res.status(404).json({ 
        success: false, 
        error: 'Libro non trovato' 
      });
    }
    
    res.json({ success: true, data: libro });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/libri - Crea nuovo libro
app.post('/api/libri', async (req, res) => {
  try {
    const nuovoLibro = {
      titolo: req.body.titolo,
      autore: req.body.autore,
      anno: parseInt(req.body.anno),
      genere: req.body.genere,
      disponibile: req.body.disponibile !== false,
      copie: parseInt(req.body.copie) || 1,
      tags: req.body.tags || [],
      data_inserimento: new Date()
    };
    
    const result = await libriCollection.insertOne(nuovoLibro);
    
    res.status(201).json({ 
      success: true, 
      data: { _id: result.insertedId, ...nuovoLibro }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/libri/:id - Aggiorna libro
app.put('/api/libri/:id', async (req, res) => {
  try {
    const updateData = {
      titolo: req.body.titolo,
      autore: req.body.autore,
      anno: parseInt(req.body.anno),
      genere: req.body.genere,
      disponibile: req.body.disponibile,
      copie: parseInt(req.body.copie),
      tags: req.body.tags
    };
    
    // Rimuovi campi undefined
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const result = await libriCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Libro non trovato' 
      });
    }
    
    res.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/libri/:id - Elimina libro
app.delete('/api/libri/:id', async (req, res) => {
  try {
    const result = await libriCollection.deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Libro non trovato' 
      });
    }
    
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/libri/cerca/:query - Ricerca libri
app.get('/api/cerca/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const libri = await libriCollection.find({
      $or: [
        { titolo: { $regex: query, $options: 'i' } },
        { autore: { $regex: query, $options: 'i' } },
        { genere: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
    
    res.json({ 
      success: true, 
      count: libri.length,
      data: libri 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/stats - Statistiche biblioteca
app.get('/api/stats', async (req, res) => {
  try {
    const totaleLibri = await libriCollection.countDocuments();
    const libriDisponibili = await libriCollection.countDocuments({ disponibile: true });
    const libriNonDisponibili = await libriCollection.countDocuments({ disponibile: false });
    
    const generi = await libriCollection.aggregate([
      { $group: { _id: "$genere", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    res.json({
      success: true,
      data: {
        totale: totaleLibri,
        disponibili: libriDisponibili,
        non_disponibili: libriNonDisponibili,
        generi: generi
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// AVVIO SERVER
// ============================================

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server in esecuzione su http://localhost:${PORT}`);
    console.log(`📖 API disponibili su http://localhost:${PORT}/api/libri`);
  });
});
