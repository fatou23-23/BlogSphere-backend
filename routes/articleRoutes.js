// routes/article.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload');
const Article = require('../models/Article');

// 📌 Créer un article
router.post('/create', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category = 'lifestyle', isDraft = false } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ msg: '❌ Utilisateur non authentifié' });
    }

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ msg: '❌ Le titre et le contenu sont obligatoires.' });
    }

    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.image || 'https://source.unsplash.com/random/400x200?sig=1';

    const newArticle = new Article({
      title,
      content,
      category,
      isDraft,
      author: req.user.id,
      image: imagePath,
    });

    await newArticle.save();
    res.status(201).json({ msg: '✅ Article créé', article: newArticle });
  } catch (error) {
    console.error('❌ Erreur création article :', error);
    res.status(500).json({ msg: '❌ Erreur serveur', error: error.message });
  }
});

// 📌 Modifier un article
router.put('/update/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: '❌ Article non trouvé' });

    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: '❌ Action non autorisée' });
    }

    const { title, content, category, isDraft } = req.body;
    const image = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.image;

    if (title) article.title = title;
    if (content) article.content = content;
    if (category) article.category = category;
    if (typeof isDraft !== 'undefined') article.isDraft = isDraft;
    if (image) article.image = image;

    await article.save();
    res.json({ msg: '✅ Article modifié', article });
  } catch (error) {
    console.error('❌ Erreur modification article :', error);
    res.status(500).json({ msg: '❌ Erreur serveur', error: error.message });
  }
});

// 📌 Supprimer un article
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: '❌ Article non trouvé' });

    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: '❌ Action non autorisée' });
    }

    await article.deleteOne();
    res.json({ msg: '✅ Article supprimé' });
  } catch (error) {
    console.error('❌ Erreur suppression article :', error);
    res.status(500).json({ msg: '❌ Erreur serveur', error: error.message });
  }
});

// 📌 Lire tous les articles (avec filtre catégorie)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const articles = await Article.find(filter)
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    console.error('❌ Erreur lecture articles :', error);
    res.status(500).json({ msg: '❌ Erreur serveur', error: error.message });
  }
});

// 📌 Lire un article par ID (et incrémenter les vues)
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'username email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' },
      });

    if (!article) return res.status(404).json({ msg: '❌ Article non trouvé' });

    article.views += 1;
    await article.save();

    res.json(article);
  } catch (error) {
    console.error('❌ Erreur lecture article :', error);
    res.status(500).json({ msg: '❌ Erreur serveur', error: error.message });
  }
});

// ❤️ Like un article
router.put('/:id/like', verifyToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: '❌ Article non trouvé' });

    const userId = req.user.id;

    article.dislikes = article.dislikes.filter(id => id.toString() !== userId);

    if (article.likes.includes(userId)) {
      article.likes = article.likes.filter(id => id.toString() !== userId);
    } else {
      article.likes.push(userId);
    }

    await article.save();
    res.json({ msg: '👍 Like mis à jour', likes: article.likes.length, dislikes: article.dislikes.length });
  } catch (error) {
    res.status(500).json({ msg: '❌ Erreur serveur', error: error.message });
  }
});

// 👎 Dislike un article
router.put('/:id/dislike', verifyToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: '❌ Article non trouvé' });

    const userId = req.user.id;

    article.likes = article.likes.filter(id => id.toString() !== userId);

    if (article.dislikes.includes(userId)) {
      article.dislikes = article.dislikes.filter(id => id.toString() !== userId);
    } else {
      article.dislikes.push(userId);
    }

    await article.save();
    res.json({ msg: '👎 Dislike mis à jour', likes: article.likes.length, dislikes: article.dislikes.length });
  } catch (error) {
    res.status(500).json({ msg: '❌ Erreur serveur', error: error.message });
  }
});

module.exports = router;
