import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('videoVaultToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('videoVaultToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    google: '/api/auth/google',
    status: '/api/auth/status',
    logout: '/api/auth/logout',
  },
  videos: {
    list: '/api/videos',
    upload: '/api/videos/upload',
    get: (id: string) => `/api/videos/${id}`,
    delete: (id: string) => `/api/videos/${id}`,
    search: '/api/videos/search/ai',
    analytics: (id: string) => `/api/videos/${id}/analytics`,
  },
  users: {
    profile: '/api/users/profile',
    stats: '/api/users/stats',
    youtubeStatus: '/api/users/youtube/status',
    youtubeSetup: '/api/users/youtube/setup',
    youtubeDisconnect: '/api/users/youtube/disconnect',
  },
};

// Helper functions for common API operations
export const apiHelpers = {
  // Upload video with progress tracking
  uploadVideo: async (files: File[], onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('videos', file);
    });

    return api.post(endpoints.videos.upload, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },

  // Get videos with pagination
  getVideos: async (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    return api.get(`${endpoints.videos.list}?${params}`);
  },

  // Search videos by AI tags
  searchVideos: async (query: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString(),
    });

    return api.get(`${endpoints.videos.search}?${params}`);
  },

  // Delete video
  deleteVideo: async (videoId: string) => {
    return api.delete(endpoints.videos.delete(videoId));
  },

  // Get video details
  getVideo: async (videoId: string) => {
    return api.get(endpoints.videos.get(videoId));
  },

  // Get video analytics
  getVideoAnalytics: async (videoId: string) => {
    return api.get(endpoints.videos.analytics(videoId));
  },

  // Get user profile
  getUserProfile: async () => {
    return api.get(endpoints.users.profile);
  },

  // Get user stats
  getUserStats: async () => {
    return api.get(endpoints.users.stats);
  },

  // Get YouTube status
  getYouTubeStatus: async () => {
    return api.get(endpoints.users.youtubeStatus);
  },

  // Setup YouTube channel
  setupYouTube: async () => {
    return api.post(endpoints.users.youtubeSetup);
  },

  // Disconnect YouTube
  disconnectYouTube: async () => {
    return api.delete(endpoints.users.youtubeDisconnect);
  },
};
