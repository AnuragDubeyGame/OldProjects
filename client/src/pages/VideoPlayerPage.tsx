import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { apiHelpers } from '../lib/api';
import { formatDuration, formatDate, formatFileSize } from '../lib/utils';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download,
  Trash2,
  Tag,
  Calendar,
  HardDrive
} from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export const VideoPlayerPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: videoData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['video', videoId],
    () => apiHelpers.getVideo(videoId!),
    {
      enabled: !!videoId,
    }
  );

  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading
  } = useQuery(
    ['video-analytics', videoId],
    () => apiHelpers.getVideoAnalytics(videoId!),
    {
      enabled: !!videoId,
    }
  );

  const video = videoData?.data?.video;
  const analytics = analyticsData?.data?.analytics;

  const handleDelete = async () => {
    if (!video) return;

    try {
      await apiHelpers.deleteVideo(video.id);
      toast.success('Video deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const handleDownload = () => {
    if (!video) return;
    
    // Create a temporary link to download the video
    const link = document.createElement('a');
    link.href = `https://www.youtube.com/watch?v=${video.youtube_video_id}`;
    link.target = '_blank';
    link.download = video.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Opening YouTube download page');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
            Video not found
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            The video you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary btn-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Gallery</span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </header>

      {/* Video Player */}
      <div className="relative w-full h-screen">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtube_video_id}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Video Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">
            {video.title}
          </h1>
          
          <div className="flex items-center space-x-6 text-white/80 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(video.upload_date)}</span>
            </div>
            
            {video.duration && (
              <div className="flex items-center space-x-1">
                <Play className="w-4 h-4" />
                <span>{formatDuration(video.duration)}</span>
              </div>
            )}
            
            {video.file_size && (
              <div className="flex items-center space-x-1">
                <HardDrive className="w-4 h-4" />
                <span>{formatFileSize(video.file_size)}</span>
              </div>
            )}
          </div>

          {video.description && (
            <p className="text-white/70 mt-3 text-sm">
              {video.description}
            </p>
          )}
        </div>
      </div>

      {/* Video Details Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-secondary-900 shadow-lg transform translate-x-full hover:translate-x-0 transition-transform duration-300 group">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Video Details
          </h3>

          <div className="space-y-4">
            {/* AI Tags */}
            {analytics?.aiTags && analytics.aiTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  AI Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analytics.aiTags.slice(0, 10).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Analytics */}
            {analytics?.youtubeAnalytics && (
              <div>
                <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  YouTube Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Views:</span>
                    <span className="text-secondary-900 dark:text-white">
                      {analytics.youtubeAnalytics.viewCount || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Video Metadata */}
            <div>
              <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Metadata
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Upload Date:</span>
                  <span className="text-secondary-900 dark:text-white">
                    {formatDate(video.upload_date)}
                  </span>
                </div>
                {video.duration && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Duration:</span>
                    <span className="text-secondary-900 dark:text-white">
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                )}
                {video.file_size && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">File Size:</span>
                    <span className="text-secondary-900 dark:text-white">
                      {formatFileSize(video.file_size)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-900 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
              Delete Video
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              Are you sure you want to delete "{video.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 btn btn-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
