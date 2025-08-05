const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload');
const Article = require('../models/Article');

// --- Créer un article
router.post('/create', verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { title, content, category = 'lifestyle', isDraft = false } = req.body;
    const author = req.user.id;
    const image = req.file?.path || req.body.image || 'https://source.unsplash.com/random/400x200?sig=1';

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ msg: '❌ Le titre et le contenu sont obligatoires.' });
    }

    const newArticle = await Article.create({ title, content, image, category, author, isDraft });
    res.status(201).json({ msg: '✅ Article créé', article: newArticle });

  } catch (error) {
    res.status(500).json({ msg: '❌ Erreur serveur', error: error.message });
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
    res.status(500).json({ msg: '❌ Erreur serveur', error: err.message });
  }
});

// --- Lire un article par ID (avec incrémentation de vues)
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
    res.status(500).json({ msg: '❌ Erreur serveur', error: err.message });
  }
});

// --- Modifier un article
router.put('/update/:id', verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { title, content, category, isDraft } = req.body;
    const image = req.file?.path || req.body.image;

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: '❌ Article non trouvé' });

    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: '❌ Action non autorisée : vous n\'êtes pas l\'auteur' });
    }

    if (title) article.title = title;
    if (content) article.content = content;
    if (category) article.category = category;
    if (typeof isDraft !== 'undefined') article.isDraft = isDraft;
    if (image) article.image = image;

    await article.save();

    res.json({ msg: '✅ Article modifié', article });
  } catch (err) {
    res.status(500).json({ msg: '❌ Erreur serveur', error: err.message });
  }
});

// --- Supprimer un article
router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: '❌ Article non trouvé' });

    console.log("🔐 Utilisateur connecté :", req.user.id);
    console.log("✏️ Auteur de l'article :", article.author.toString());

    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: '❌ Action non autorisée : vous n\'êtes pas l\'auteur' });
    }

    await article.deleteOne();
    res.json({ msg: '✅ Article supprimé' });
  } catch (err) {
    res.status(500).json({ msg: '❌ Erreur serveur', error: err.message });
  }
});

// --- Rechercher par mot clé ou catégorie
router.get('/search', async (req, res) => {
  try {
    const { q, category } = req.query;
    const filter = {};

    if (q) filter.title = { $regex: q, $options: 'i' };
    if (category) filter.category = category;

    const articles = await Article.find(filter)
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ msg: '❌ Erreur serveur', error: err.message });
  }
});

// --- (Optionnel) Voir seulement mes articles
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const myArticles = await Article.find({ author: req.user.id })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(myArticles);
  } catch (err) {
    res.status(500).json({ msg: '❌ Erreur serveur', error: err.message });
  }
});

module.exports = router;
