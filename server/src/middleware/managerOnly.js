module.exports = (req, res, next) => {
  if (req.user.role !== "manager")
    return res.status(403).json({ error: "Access denied. Managers only." });
  next();
};