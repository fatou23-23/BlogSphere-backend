const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Connect to DB + Start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connexion MongoDB réussie 🚀");
    app.listen(process.env.PORT, () =>
      console.log(`✅ Serveur en ligne sur le port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error("❌ Erreur MongoDB :", err));
