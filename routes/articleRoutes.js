const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const Article = require('../models/Article');
const Comment = require('../models/Comment');

// ✅ Créer un article ou un brouillon
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { title, content, category, isDraft, image } = req.body;

    const article = new Article({
      title,
      content,
      category,
      image, // ✅ ajout du champ image
      isDraft: isDraft || false,
      author: req.userId
    });

    await article.save();
    res.status(201).json({ msg: 'Article créé ✅', article });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// ✅ Récupérer tous les articles (avec recherche, filtre, pagination)
router.get('/', async (req, res) => {
  try {
    const { category, q, page = 1, limit = 5, sort = 'createdAt' } = req.query;
    const filter = { isDraft: false };
    if (category) filter.category = category;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const articles = await Article.find(filter)
      .populate('author', 'username email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' }
      })
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Article.countDocuments(filter);

    res.json({
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      articles
    });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// ✅ Lire un article + augmenter les vues
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username email bio')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' }
      })
      .populate('likes');

    if (!article) return res.status(404).json({ msg: 'Article non trouvé ❌' });

    res.json(article);
  } catch (err) {
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// ✅ Modifier un article
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, content, category, isDraft, image } = req.body;

    const updatedArticle = await Article.findOneAndUpdate(
      { _id: req.params.id, author: req.userId },
      { title, content, category, isDraft, image }, // ✅ inclure image
      { new: true, runValidators: true }
    );

    if (!updatedArticle)
      return res.status(403).json({ msg: 'Modification refusée ❌' });

    res.json({ msg: 'Article modifié ✅', article: updatedArticle });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// ✅ Supprimer un article
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Article.findOneAndDelete({
      _id: req.params.id,
      author: req.userId
    });

    if (!deleted)
      return res.status(403).json({ msg: 'Suppression refusée ❌' });

    res.json({ msg: 'Article supprimé ✅', article: deleted });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// ✅ Like / Unlike
router.put('/:id/like', verifyToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: 'Article non trouvé ❌' });

    const liked = article.likes.includes(req.userId);

    if (liked) {
      article.likes.pull(req.userId);
    } else {
      article.likes.push(req.userId);
    }

    await article.save();
    res.json({
      msg: liked ? 'Like retiré ❌' : 'Article liké ❤️',
      totalLikes: article.likes.length
    });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

// ✅ Dislike / Undislike
router.put('/:id/dislike', verifyToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: 'Article non trouvé ❌' });

    const disliked = article.dislikes.includes(req.userId);

    if (disliked) {
      article.dislikes.pull(req.userId);
    } else {
      article.dislikes.push(req.userId);
    }

    await article.save();
    res.json({
      msg: disliked ? 'Dislike retiré ❌' : 'Article disliké 👎',
      totalDislikes: article.dislikes.length
    });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
