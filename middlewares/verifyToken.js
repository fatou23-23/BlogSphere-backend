const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "❌ Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // c'est ici qu'on définit req.user.id
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "❌ Session expirée, veuillez vous reconnecter" });
    }
    console.error("Erreur vérification token :", err);
    res.status(403).json({ msg: "❌ Token invalide" });
  }
};

module.exports = verifyToken;
