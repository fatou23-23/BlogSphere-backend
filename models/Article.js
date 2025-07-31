// routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const Article = require('../models/Article');


// ✅ POST /api/articles/create
router.post('/create', verifyToken, async (req, res) => {
  console.log("📥 Route /api/articles/create appelée");
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ msg: "Titre et contenu requis ❌" });
  }

  try {
    const article = new Article({
      title,
      content,
      author: req.userId
    });

    const savedArticle = await article.save();

    res.status(201).json({
      msg: "Article créé avec succès ✅",
      article: savedArticle
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'article :", error.message);
    res.status(500).json({ msg: "Erreur serveur", error: error.message });
  }
});
module.exports = router;
