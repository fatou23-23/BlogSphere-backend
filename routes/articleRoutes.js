const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const Article = require('../models/Article');

router.post('/create', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    const article = new Article({
      title,
      content,
      author: req.userId
    });

    console.log("Article :", article);
    

    await article.save();
    res.status(201).json({ msg: "Article créé ✅", article });
  } catch (error) {
    console.error("Erreur lors de la création de l'article :", error);
    res.status(500).json({ msg: "Erreur serveur", error: error.message });
  }
});

module.exports = router;
