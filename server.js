const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const articleRoutes = require('./routes/articleRoutes');

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes');
const commentRoute = require('./routes/commentRoute');



const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));



app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // 👈 donc /api/user/profile
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoute);
// console.log('✅ articleRoutes est :', typeof articleRoutes);
app.get('/', (req, res) => {
  res.send("Bienvenue sur mon backend");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connexion MongoDB réussie 🚀");
    app.listen(process.env.PORT, () =>
      console.log(`✅ Serveur en ligne sur le port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error("❌ Erreur MongoDB :", err));
