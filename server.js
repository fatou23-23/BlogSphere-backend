const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // ✅ pour servir les fichiers statiques

dotenv.config();

const articleRoutes = require('./routes/articleRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoute = require('./routes/commentRoute');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Servir les images statiques du dossier 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // 👈 donc /api/user/profile
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoute);

// Route test
app.get('/', (req, res) => {
  res.send("Bienvenue sur mon backend");
});

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connexion MongoDB réussie 🚀");
    app.listen(process.env.PORT, () =>
      console.log(`✅ Serveur en ligne sur le port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error("❌ Erreur MongoDB :", err));
