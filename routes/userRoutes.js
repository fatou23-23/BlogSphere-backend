const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const User = require('../models/User');
const Article = require('../models/Article');

// ✅ GET /api/user/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: "Utilisateur non trouvé ❌" });
    }
    res.json({ msg: "Accès au profil autorisé ✅", user });
  } catch (error) {
    res.status(500).json({ msg: "Erreur serveur", error: error.message });
  }
});

// ✅ POST /api/user/articles/create
router.post('/articles/create', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const article = new Article({
      title,
      content,
      author: req.userId
    });

    await article.save();
    res.status(201).json({ msg: "Article créé ✅", article });
  } catch (error) {
    console.error("Erreur lors de la création de l'article :", error);
    res.status(500).json({ msg: "Erreur serveur", error: error.message });
  }
});

// ✅ GET /api/user/articles
router.get('/articles', verifyToken, async (req, res) => {
  try {
    const articles = await Article.find({ author: req.userId })
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      msg: "Articles de l'utilisateur récupérés ✅",
      articles
    });
  } catch (err) {
    console.error("❌ Erreur /user/articles :", err);
    res.status(500).json({ msg: "Erreur serveur" });
  }
});

// ✅ PUT /api/user/articles/:id (modifier article)
router.put('/articles/:id', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    const article = await Article.findOneAndUpdate(
      { _id: req.params.id, author: req.userId },
      { title, content },
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ msg: "Article non trouvé ou accès refusé ❌" });
    }

    res.json({ msg: "Article modifié ✅", article });
  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
});

// ✅ DELETE /api/user/articles/:id (supprimer article)
router.delete('/articles/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Article.findOneAndDelete({
      _id: req.params.id,
      author: req.userId
    });

    if (!deleted) {
      return res.status(404).json({ msg: "Article non trouvé ou accès refusé ❌" });
    }

    res.json({ msg: "Article supprimé ✅" });
  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur", error: err.message });
  }
});

// ✅ PUT /api/user/update (mettre à jour profil - bio/avatar)
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

module.exports = router;
