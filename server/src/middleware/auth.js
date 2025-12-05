const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  
  // Check for token in Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Non autorisé - Token manquant' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    
    // FIX: Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Non autorisé - Utilisateur non trouvé' });
    }
    
    // Attach user to request with consistent structure
    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Token invalide' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    // FIX: Added check for req.user existence
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorisé - Utilisateur non authentifié' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Accès refusé - Rôle ${req.user.role} non autorisé` 
      });
    }
    next();
  };
};