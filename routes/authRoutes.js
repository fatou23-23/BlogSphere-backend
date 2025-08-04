const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');


// ✅ Route : POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ msg: "Email ou nom d'utilisateur déjà utilisé ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: "Inscription réussie ✅" });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ msg: "Erreur serveur lors de l'inscription" });
  }
});
// ✅ Route POST /api/auth/logout (fausse déconnexion, juste informative)
router.post('/logout', (req, res) => {
  res.status(200).json({ msg: "Déconnexion réussie ✅ " });
});
// ✅ Route : récupérer le profil via /api/auth/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé ❌" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
});

// ✅ Route : POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifie si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Email invalide ❌" });
    }

    // Compare les mots de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Mot de passe incorrect ❌" });
    }

    // Génère le token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({
      msg: "Connexion réussie ✅",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ msg: "Erreur serveur lors de la connexion" });
  }
});
// 🔄 Route : modifier le profil de l'utilisateur connecté
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, email, bio, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
  req.userId,
  { username, email, bio, avatar },
  { new: true, runValidators: true }
).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ msg: "Utilisateur non trouvé ❌" });
    }

    res.status(200).json({
      msg: "Profil mis à jour ✅",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
});


module.exports = router;
