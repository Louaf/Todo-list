import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  //console.log(token);
  if (!token) return res.status(401).json({ message: "no token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "try to login again !" });
    req.userId = decoded.id;
    next();
  });
}

export default authMiddleware;
