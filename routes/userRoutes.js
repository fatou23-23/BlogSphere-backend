const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const User = require('../models/User');
const Article = require('../models/Article');



// ✅ GET /api/user/profile
router.get('/articles', verifyToken, async (req, res) => {
  console.log("Route GET /api/user/articles appelée, userId:", req.userId);
  try {
    const articles = await Article.find({ author: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      msg: "Articles de l'utilisateur récupérés ✅",
      articles
    });
  } catch (err) {
    console.error("❌ Erreur /user/articles :", err);  // Ajoute ce log
    res.status(500).json({ msg: "Erreur serveur" });
  }
});


// ✅ PUT /api/user/update
router.put('/update', verifyToken, async (req, res) => {
  const { bio, avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      msg: "Profil mis à jour ✅",
      user
    });
  } catch (err) {
    console.error("Erreur update profile:", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// ✅ GET /api/user/articles : lister les articles de l'utilisateur connecté
router.get('/articles', verifyToken, async (req, res) => {
  console.log("Route GET /api/user/articles appelée, userId:", req.userId);
  try {
    const articles = await Article.find({ author: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      msg: "Articles de l'utilisateur récupérés ✅",
      articles
    });
  } catch (err) {
    console.error("Erreur /user/articles :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});


module.exports = router;
