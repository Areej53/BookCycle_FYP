const jwt = require("jsonwebtoken");

const adminAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Unauthorized. Please add valid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, name, role } = decoded;
    
    if (role !== 'admin') {
      return res.status(403).json({ msg: "Forbidden. Admin access required" });
    }
    
    req.user = { id, name, role };
    next();
  } catch {
    return res.status(401).json({ msg: "Unauthorized. Please add valid token" });
  }
};

module.exports = adminAuthMiddleware;
