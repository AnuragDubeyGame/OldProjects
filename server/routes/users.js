const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { oauth2Client, getUserChannel, setUserCredentials } = require('../config/youtube');

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const { user } = req;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        youtube_channel_id: user.youtube_channel_id,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      code: 'FETCH_PROFILE_ERROR'
    });
  }
});

// Update user profile
router.put('/profile', 
  [
    body('name').optional().isLength({ min: 1, max: 100 }).trim(),
    body('picture').optional().isURL()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        });
      }

      const { user } = req;
      const { name, picture } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (picture) updateData.picture = picture;
      updateData.updated_at = new Date().toISOString();

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          picture: updatedUser.picture,
          youtube_channel_id: updatedUser.youtube_channel_id
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        error: 'Failed to update profile',
        code: 'UPDATE_PROFILE_ERROR'
      });
    }
  }
);

// Get YouTube channel status
router.get('/youtube/status', async (req, res) => {
  try {
    const { user } = req;

    if (!user.youtube_channel_id) {
      return res.json({
        hasChannel: false,
        message: 'No YouTube channel connected'
      });
    }

    // Check if we can access the channel
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('access_token, refresh_token')
        .eq('id', user.id)
        .single();

      if (userError || !userData.access_token) {
        return res.json({
          hasChannel: true,
          accessible: false,
          message: 'YouTube access token expired'
        });
      }

      setUserCredentials(userData.access_token, userData.refresh_token);
      const channel = await getUserChannel();

      res.json({
        hasChannel: true,
        accessible: true,
        channel: {
          id: channel.channelId,
          title: channel.title,
          description: channel.description,
          thumbnailUrl: channel.thumbnailUrl
        }
      });

    } catch (accessError) {
      res.json({
        hasChannel: true,
        accessible: false,
        message: 'Cannot access YouTube channel',
        error: accessError.message
      });
    }

  } catch (error) {
    console.error('YouTube status error:', error);
    res.status(500).json({ 
      error: 'Failed to check YouTube status',
      code: 'YOUTUBE_STATUS_ERROR'
    });
  }
});

// Setup YouTube channel
router.post('/youtube/setup', async (req, res) => {
  try {
    const { user } = req;

    // Check if user already has a channel
    if (user.youtube_channel_id) {
      return res.status(400).json({
        error: 'YouTube channel already connected',
        code: 'CHANNEL_ALREADY_CONNECTED'
      });
    }

    // Get user's stored tokens
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('access_token, refresh_token')
      .eq('id', user.id)
      .single();

    if (userError || !userData.access_token) {
      return res.status(401).json({
        error: 'YouTube access not available',
        code: 'YOUTUBE_ACCESS_MISSING'
      });
    }

    setUserCredentials(userData.access_token, userData.refresh_token);

    // Try to get existing channel
    let channel = await getUserChannel();

    if (!channel) {
      // Channel doesn't exist, user needs to create one
      return res.status(404).json({
        error: 'No YouTube channel found',
        code: 'NO_CHANNEL_FOUND',
        message: 'Please create a YouTube channel first'
      });
    }

    // Update user with channel ID
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ youtube_channel_id: channel.channelId })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      message: 'YouTube channel connected successfully',
      channel: {
        id: channel.channelId,
        title: channel.title,
        description: channel.description,
        thumbnailUrl: channel.thumbnailUrl
      }
    });

  } catch (error) {
    console.error('YouTube setup error:', error);
    res.status(500).json({ 
      error: 'Failed to setup YouTube channel',
      code: 'YOUTUBE_SETUP_ERROR'
    });
  }
});

// Disconnect YouTube channel
router.delete('/youtube/disconnect', async (req, res) => {
  try {
    const { user } = req;

    if (!user.youtube_channel_id) {
      return res.status(400).json({
        error: 'No YouTube channel connected',
        code: 'NO_CHANNEL_CONNECTED'
      });
    }

    // Remove channel ID from user
    await supabase
      .from('users')
      .update({ 
        youtube_channel_id: null,
        access_token: null,
        refresh_token: null,
        token_expiry: null
      })
      .eq('id', user.id);

    res.json({
      message: 'YouTube channel disconnected successfully'
    });

  } catch (error) {
    console.error('YouTube disconnect error:', error);
    res.status(500).json({ 
      error: 'Failed to disconnect YouTube channel',
      code: 'YOUTUBE_DISCONNECT_ERROR'
    });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const { user } = req;

    // Get video count
    const { count: videoCount, error: videoError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (videoError) {
      throw videoError;
    }

    // Get total storage used
    const { data: videos, error: storageError } = await supabase
      .from('videos')
      .select('file_size')
      .eq('user_id', user.id);

    if (storageError) {
      throw storageError;
    }

    const totalStorage = videos.reduce((sum, video) => sum + (video.file_size || 0), 0);

    // Get recent uploads
    const { data: recentVideos, error: recentError } = await supabase
      .from('videos')
      .select('upload_date')
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false })
      .limit(5);

    if (recentError) {
      throw recentError;
    }

    res.json({
      stats: {
        totalVideos: videoCount || 0,
        totalStorage: totalStorage,
        recentUploads: recentVideos.length,
        hasYouTubeChannel: !!user.youtube_channel_id
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      code: 'FETCH_STATS_ERROR'
    });
  }
});

module.exports = router;
