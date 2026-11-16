import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required." });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    if (req.admin.role === "customer") return res.status(403).json({ message: "Admin access required." });
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}
