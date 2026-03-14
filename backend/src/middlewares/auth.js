import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireManager = (req, res, next) => {
  if (req.user?.role !== "manager") {
    return res.status(403).json({ message: "Manager access required" });
  }
  next();
};

export const requireStaff = (req, res, next) => {
  if (req.user?.role !== "staff") {
    return res.status(403).json({ message: "Staff access required" });
  }
  next();
};

