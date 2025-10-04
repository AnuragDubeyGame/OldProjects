const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { 
  setUserCredentials, 
  uploadVideo, 
  getVideoDetails, 
  deleteVideo, 
  parseDuration 
} = require('../config/youtube');
const { analyzeVideoContent } = require('../config/videoIntelligence');
const { requireYouTubeAccess } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 5 // Max 5 files at once
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Get user's videos with pagination
router.get('/', async (req, res) => {
  try {
    const { user } = req;
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,ai_tags::text.ilike.%${search}%`);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: videos, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || videos.length,
        hasMore: videos.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch videos',
      code: 'FETCH_VIDEOS_ERROR'
    });
  }
});

// Upload video(s)
router.post('/upload', 
  requireYouTubeAccess,
  upload.array('videos', 5),
  async (req, res) => {
    try {
      const { user } = req;
      const files = req.files;
      
      if (!files || files.length === 0) {
        return res.status(400).json({ 
          error: 'No video files provided',
          code: 'NO_FILES_PROVIDED'
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

      // Set user credentials for YouTube API
      setUserCredentials(userData.access_token, userData.refresh_token);

      const uploadResults = [];

      for (const file of files) {
        try {
          // Upload to YouTube
          const title = req.body.title || path.parse(file.originalname).name;
          const description = req.body.description || 'Uploaded via Video Vault';
          
          const youtubeResult = await uploadVideo(file.path, title, description);
          
          // Get additional video details
          const videoDetails = await getVideoDetails(youtubeResult.videoId);
          
          // Save to database
          const { data: video, error: dbError } = await supabase
            .from('videos')
            .insert({
              user_id: user.id,
              youtube_video_id: youtubeResult.videoId,
              title: youtubeResult.title,
              description: youtubeResult.description,
              thumbnail_url: youtubeResult.thumbnailUrl,
              duration: parseDuration(videoDetails.duration),
              file_size: youtubeResult.fileSize,
              upload_date: new Date().toISOString()
            })
            .select()
            .single();

          if (dbError) {
            throw dbError;
          }

          // Start AI analysis in background
          setTimeout(async () => {
            try {
              const videoUri = `gs://youtube-videos/${youtubeResult.videoId}`;
              const analysis = await analyzeVideoContent(videoUri);
              
              await supabase
                .from('videos')
                .update({ ai_tags: analysis.searchTags })
                .eq('youtube_video_id', youtubeResult.videoId);
            } catch (analysisError) {
              console.error('AI analysis failed for video:', youtubeResult.videoId, analysisError);
            }
          }, 5000); // Wait 5 seconds for YouTube processing

          uploadResults.push({
            success: true,
            video: {
              id: video.id,
              youtube_video_id: youtubeResult.videoId,
              title: youtubeResult.title,
              thumbnail_url: youtubeResult.thumbnailUrl,
              duration: parseDuration(videoDetails.duration),
              file_size: youtubeResult.fileSize
            }
          });

          // Clean up uploaded file
          await fs.unlink(file.path);

        } catch (uploadError) {
          console.error('Upload error for file:', file.originalname, uploadError);
          
          // Clean up file on error
          try {
            await fs.unlink(file.path);
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
          }

          uploadResults.push({
            success: false,
            filename: file.originalname,
            error: uploadError.message
          });
        }
      }

      res.json({
        message: 'Upload completed',
        results: uploadResults
      });

    } catch (error) {
      console.error('Upload route error:', error);
      res.status(500).json({ 
        error: 'Upload failed',
        code: 'UPLOAD_ERROR'
      });
    }
  }
);

// Get single video details
router.get('/:videoId', async (req, res) => {
  try {
    const { user } = req;
    const { videoId } = req.params;

    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single();

    if (error || !video) {
      return res.status(404).json({ 
        error: 'Video not found',
        code: 'VIDEO_NOT_FOUND'
      });
    }

    res.json({ video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch video',
      code: 'FETCH_VIDEO_ERROR'
    });
  }
});

// Delete video
router.delete('/:videoId', 
  requireYouTubeAccess,
  async (req, res) => {
    try {
      const { user } = req;
      const { videoId } = req.params;

      // Get video from database
      const { data: video, error: dbError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .eq('user_id', user.id)
        .single();

      if (dbError || !video) {
        return res.status(404).json({ 
          error: 'Video not found',
          code: 'VIDEO_NOT_FOUND'
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

      // Set user credentials for YouTube API
      setUserCredentials(userData.access_token, userData.refresh_token);

      // Delete from YouTube
      await deleteVideo(video.youtube_video_id);

      // Delete from database
      await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)
        .eq('user_id', user.id);

      res.json({ 
        message: 'Video deleted successfully',
        videoId: video.youtube_video_id
      });

    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({ 
        error: 'Failed to delete video',
        code: 'DELETE_VIDEO_ERROR'
      });
    }
  }
);

// Search videos by AI tags
router.get('/search/ai', async (req, res) => {
  try {
    const { user } = req;
    const { query, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({ 
        error: 'Search query required',
        code: 'SEARCH_QUERY_REQUIRED'
      });
    }

    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .contains('ai_tags', [query.toLowerCase()])
      .order('upload_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      videos,
      query,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: videos.length,
        hasMore: videos.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      code: 'SEARCH_ERROR'
    });
  }
});

// Get video analytics
router.get('/:videoId/analytics', async (req, res) => {
  try {
    const { user } = req;
    const { videoId } = req.params;

    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single();

    if (error || !video) {
      return res.status(404).json({ 
        error: 'Video not found',
        code: 'VIDEO_NOT_FOUND'
      });
    }

    // Get YouTube analytics if available
    let youtubeAnalytics = null;
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('access_token, refresh_token')
        .eq('id', user.id)
        .single();

      if (userData?.access_token) {
        setUserCredentials(userData.access_token, userData.refresh_token);
        const details = await getVideoDetails(video.youtube_video_id);
        youtubeAnalytics = {
          viewCount: details.viewCount,
          uploadDate: details.uploadDate
        };
      }
    } catch (analyticsError) {
      console.warn('YouTube analytics failed:', analyticsError.message);
    }

    res.json({
      video,
      analytics: {
        aiTags: video.ai_tags || [],
        youtubeAnalytics
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      code: 'ANALYTICS_ERROR'
    });
  }
});

module.exports = router;
