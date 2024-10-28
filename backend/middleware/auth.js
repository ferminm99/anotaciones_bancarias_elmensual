const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "tu-secreto";

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user; // Puedes usar `req.user` para datos de usuario
    next();
  });
};

module.exports = authenticateToken;
