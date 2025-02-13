const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // ✅ Extract token from cookies OR Authorization header
    let token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // ✅ Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Ensure the user is an admin
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Not an admin" });
    }

    req.admin = { username: decoded.username, email: decoded.email };
    next();
  } catch (err) {
    console.error("JWT Verification Failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
