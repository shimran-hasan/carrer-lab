import jwt from "jsonwebtoken";
export function customerProtect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please sign in to continue." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "customer") return res.status(403).json({ message: "Customer account required." });
    req.customer = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}
