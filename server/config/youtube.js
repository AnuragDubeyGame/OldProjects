const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Initialize YouTube API
const youtube = google.youtube('v3');

// OAuth2 client for user authentication
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Service account client for AI operations
let serviceAccountClient = null;
if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
  try {
    const credentials = JSON.parse(
      fs.readFileSync(process.env.GOOGLE_CLOUD_CREDENTIALS, 'utf8')
    );
    serviceAccountClient = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  } catch (error) {
    console.warn('Failed to load Google Cloud credentials:', error.message);
  }
}

// Set user credentials for YouTube operations
const setUserCredentials = (accessToken, refreshToken) => {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });
};

// Upload video to YouTube
const uploadVideo = async (filePath, title, description = '') => {
  try {
    const fileSize = fs.statSync(filePath).size;
    
    const res = await youtube.videos.insert({
      auth: oauth2Client,
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: title,
          description: description,
          tags: ['VideoVault', 'private']
        },
        status: {
          privacyStatus: 'private',
          selfDeclaredMadeForKids: false
        }
      },
      media: {
        body: fs.createReadStream(filePath)
      }
    });

    return {
      videoId: res.data.id,
      title: res.data.snippet.title,
      description: res.data.snippet.description,
      thumbnailUrl: res.data.snippet.thumbnails?.default?.url,
      duration: null, // Will be fetched separately
      fileSize: fileSize
    };
  } catch (error) {
    console.error('YouTube upload error:', error);
    throw new Error(`Failed to upload video: ${error.message}`);
  }
};

// Get video details
const getVideoDetails = async (videoId) => {
  try {
    const res = await youtube.videos.list({
      auth: oauth2Client,
      part: 'snippet,contentDetails,statistics',
      id: videoId
    });

    if (!res.data.items || res.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = res.data.items[0];
    return {
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl: video.snippet.thumbnails?.maxres?.url || 
                   video.snippet.thumbnails?.high?.url ||
                   video.snippet.thumbnails?.default?.url,
      duration: video.contentDetails.duration, // ISO 8601 duration
      uploadDate: video.snippet.publishedAt,
      viewCount: video.statistics.viewCount
    };
  } catch (error) {
    console.error('YouTube get video error:', error);
    throw new Error(`Failed to get video details: ${error.message}`);
  }
};

// Delete video from YouTube
const deleteVideo = async (videoId) => {
  try {
    await youtube.videos.delete({
      auth: oauth2Client,
      id: videoId
    });
    return true;
  } catch (error) {
    console.error('YouTube delete error:', error);
    throw new Error(`Failed to delete video: ${error.message}`);
  }
};

// Get user's YouTube channel
const getUserChannel = async () => {
  try {
    const res = await youtube.channels.list({
      auth: oauth2Client,
      part: 'snippet,contentDetails',
      mine: true
    });

    if (!res.data.items || res.data.items.length === 0) {
      return null;
    }

    return {
      channelId: res.data.items[0].id,
      title: res.data.items[0].snippet.title,
      description: res.data.items[0].snippet.description,
      thumbnailUrl: res.data.items[0].snippet.thumbnails?.default?.url
    };
  } catch (error) {
    console.error('YouTube get channel error:', error);
    throw new Error(`Failed to get channel: ${error.message}`);
  }
};

// Get user's videos
const getUserVideos = async (maxResults = 50, pageToken = null) => {
  try {
    const res = await youtube.search.list({
      auth: oauth2Client,
      part: 'snippet',
      forMine: true,
      type: 'video',
      maxResults: maxResults,
      pageToken: pageToken,
      order: 'date'
    });

    return {
      videos: res.data.items || [],
      nextPageToken: res.data.nextPageToken,
      totalResults: res.data.pageInfo.totalResults
    };
  } catch (error) {
    console.error('YouTube get videos error:', error);
    throw new Error(`Failed to get videos: ${error.message}`);
  }
};

// Convert ISO 8601 duration to seconds
const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] || '').replace('H', '') || 0;
  const minutes = (match[2] || '').replace('M', '') || 0;
  const seconds = (match[3] || '').replace('S', '') || 0;
  
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
};

module.exports = {
  oauth2Client,
  serviceAccountClient,
  setUserCredentials,
  uploadVideo,
  getVideoDetails,
  deleteVideo,
  getUserChannel,
  getUserVideos,
  parseDuration
};
