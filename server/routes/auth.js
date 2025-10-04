const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { oauth2Client, getUserChannel, setUserCredentials } = require('../config/youtube');

const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      google_id: user.google_id,
      email: user.email,
      id: user.id 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Google OAuth login URL
router.get('/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({ authUrl });
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ 
        error: 'Authorization code required',
        code: 'AUTH_CODE_MISSING'
      });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = require('google-auth-library').OAuth2Client;
    const userInfoClient = new oauth2(process.env.GOOGLE_CLIENT_ID);
    userInfoClient.setCredentials(tokens);

    const userInfoResponse = await userInfoClient.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });

    const userInfo = userInfoResponse.data;

    // Check if user exists in database
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', userInfo.sub)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    if (!user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          google_id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      user = newUser;
    } else {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          name: userInfo.name,
          picture: userInfo.picture,
          updated_at: new Date().toISOString()
        })
        .eq('google_id', userInfo.sub)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      user = updatedUser;
    }

    // Check YouTube channel access
    let youtubeChannel = null;
    try {
      setUserCredentials(tokens.access_token, tokens.refresh_token);
      youtubeChannel = await getUserChannel();
      
      if (youtubeChannel && !user.youtube_channel_id) {
        // Update user with YouTube channel ID
        await supabase
          .from('users')
          .update({ youtube_channel_id: youtubeChannel.channelId })
          .eq('google_id', userInfo.sub);
        
        user.youtube_channel_id = youtubeChannel.channelId;
      }
    } catch (youtubeError) {
      console.warn('YouTube channel access failed:', youtubeError.message);
      // Continue without YouTube access - user can grant it later
    }

    // Generate JWT token
    const token = generateToken(user);

    // Store tokens securely (in production, encrypt these)
    await supabase
      .from('users')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: new Date(tokens.expiry_date).toISOString()
      })
      .eq('google_id', userInfo.sub);

    // Redirect to frontend with token
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.FRONTEND_URL}/auth/callback?token=${token}`
      : `http://localhost:3000/auth/callback?token=${token}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(error.message)}`
      : `http://localhost:3000/auth/error?message=${encodeURIComponent(error.message)}`;
    
    res.redirect(errorUrl);
  }
});

// Grant YouTube permissions (for users who didn't grant them initially)
router.post('/youtube/grant', async (req, res) => {
  try {
    const { user } = req;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('YouTube grant error:', error);
    res.status(500).json({ 
      error: 'Failed to generate YouTube auth URL',
      code: 'YOUTUBE_AUTH_ERROR'
    });
  }
});

// Check authentication status
router.get('/status', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        authenticated: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', decoded.google_id)
      .single();

    if (error || !user) {
      return res.status(401).json({ 
        authenticated: false,
        message: 'Invalid token'
      });
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        youtube_channel_id: user.youtube_channel_id
      }
    });
  } catch (error) {
    res.status(401).json({ 
      authenticated: false,
      message: 'Token verification failed'
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { user } = req;
    
    if (user) {
      // Clear stored tokens
      await supabase
        .from('users')
        .update({
          access_token: null,
          refresh_token: null,
          token_expiry: null
        })
        .eq('google_id', user.google_id);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

module.exports = router;
