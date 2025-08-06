const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload');
const Article = require('../models/Article');

// --- Créer un article
router.post('/create', upload.single("image"), verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "❌ Utilisateur non authentifié" });
    }

    const { title, content, category = 'lifestyle', isDraft = false } = req.body;
    const author = req.user.id;
    const image = req.file?.path || req.body.image || 'https://source.unsplash.com/random/400x200?sig=1';

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ msg: '❌ Le titre et le contenu sont obligatoires.' });
    }

    const newArticle = await Article.create({ title, content, image, category, author, isDraft });
    res.status(201).json({ msg: '✅ Article créé', article: newArticle });

  } catch (error) {
    console.error("Erreur création article :", error);
    res.status(500).json({ msg: '❌ Erreur serveur', error: error.message });
  }
});

// --- Modifier un article (seulement par l’auteur)
router.put('/update/:id', upload.single("image"), verifyToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: '❌ Article non trouvé' });

    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: '❌ Action non autorisée : vous n\'êtes pas l\'auteur' });
    }

    const { title, content, category, isDraft } = req.body;
    const image = req.file?.path || req.body.image;

    if (title) article.title = title;
    if (content) article.content = content;
    if (category) article.category = category;
    if (typeof isDraft !== 'undefined') article.isDraft = isDraft;
    if (image) article.image = image;

    await article.save();
    res.json({ msg: '✅ Article modifié', article });
  } catch (err) {
    console.error("Erreur modification article :", err);
    res.status(500).json({ msg: '❌ Erreur serveur', error: err.message });
  }
});

// --- Supprimer un article (seulement par l’auteur)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: '❌ Article non trouvé' });

    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: '❌ Action non autorisée : vous n\'êtes pas l\'auteur' });
    }

    await article.deleteOne();
    res.json({ msg: '✅ Article supprimé' });
  } catch (err) {
    console.error("Erreur suppression article :", err);
    res.status(500).json({ msg: '❌ Erreur serveur', error: err.message });
  }
});

// --- Lire tous les articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    console.error("Erreur lecture articles :", err);
    res.status(500).json({ msg: '❌ Erreur serveur', error: err.message });
  }
});

// --- Lire un article par ID
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'username email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' }
      });

    if (!article) return res.status(404).json({ msg: '❌ Article non trouvé' });

    article.views += 1;
    await article.save();

    res.json(article);
  } catch (err) {
    console.error("Erreur lecture article :", err);
    res.status(500).json({ msg: '❌ Erreur serveur', error: err.message });
  }
});

module.exports = router;
