const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const verifyToken = require('../middlewares/verifyToken');

// ➕ Créer un commentaire
router.post('/:articleId', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const { articleId } = req.params;

    const comment = new Comment({
      content,
      article: articleId,
      author: req.userId
    });

    await comment.save();
    res.status(201).json({ msg: "Commentaire ajouté ✅", comment });
  } catch (error) {
    res.status(500).json({ msg: "Erreur serveur", error: error.message });
  }
});

// 🔎 Voir tous les commentaires d’un article
router.get('/:articleId', async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.articleId })
      .populate('author', 'prenom email')
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ msg: "Erreur serveur", error: error.message });
  }
});

// ❌ Supprimer un commentaire (par son auteur uniquement)
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      author: req.userId
    });

    if (!comment) {
      return res.status(404).json({ msg: "Commentaire non trouvé ou accès refusé ❌" });
    }

    res.status(200).json({ msg: "Commentaire supprimé ✅" });
  } catch (error) {
    res.status(500).json({ msg: "Erreur serveur", error: error.message });
  }
});

module.exports = router;
