const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    console.log("❌ No token provided in request headers.");
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Handle "Bearer token_value" format
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim(); // Remove "Bearer " prefix and trim spaces
  }

  try {
    console.log("🔹 Token received:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token successfully verified:", decoded);

    // Ensure the decoded token has a 'userId' field (not 'id')
    if (!decoded.userId) {
      console.log("❌ Token does not contain userId.");
      return res.status(400).json({ message: "Invalid token: Missing user ID." });
    }

    req.user = { id: decoded.userId };  // ✅ Correct assignment
    console.log("🔹 User authenticated with ID:", req.user.id);

    next(); // Proceed to the next middleware
  } catch (error) {
    console.log("❌ Invalid token:", error.message);
    return res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
