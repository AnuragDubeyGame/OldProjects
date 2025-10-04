const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', decoded.google_id)
      .single();

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

const requireYouTubeAccess = async (req, res, next) => {
  try {
    if (!req.user.youtube_channel_id) {
      return res.status(403).json({
        error: 'YouTube channel access required',
        code: 'YOUTUBE_ACCESS_REQUIRED'
      });
    }
    next();
  } catch (error) {
    console.error('YouTube access check error:', error);
    return res.status(500).json({
      error: 'YouTube access verification failed',
      code: 'YOUTUBE_VERIFICATION_ERROR'
    });
  }
};

module.exports = {
  authenticateToken,
  requireYouTubeAccess
};
