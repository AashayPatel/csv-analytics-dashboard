import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (err) { 
    console.error("Token verification failed:", err);
    res.status(403).json({ 
      error: "Invalid or expired token",
      details: err.message 
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      error: "Admin access required",
      message: "This action requires administrator privileges"
    });
  }
  next();
};

export const checkDataOwnership = async (req, res, next) => {
  try {
    const dataId = req.params.id;
    const data = await DataRow.findOne({ 
      _id: dataId,
      uploadedBy: req.user.userId 
    });

    if (!data) {
      return res.status(404).json({ 
        error: "Data not found or access denied" 
      });
    }

    res.locals.data = data;
    next();
  } catch (err) {
    console.error("Ownership check failed:", err);
    res.status(500).json({ 
      error: "Ownership verification failed",
      details: err.message 
    });
  }
};