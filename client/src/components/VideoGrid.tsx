import React from 'react';
import { useInView } from 'react-intersection-observer';
import { formatDuration, formatRelativeTime } from '../lib/utils';
import { Play, Clock, Calendar } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  duration?: number;
  upload_date: string;
  youtube_video_id: string;
  ai_tags?: string[];
}

interface VideoGridProps {
  videos: Video[];
  viewMode: 'grid' | 'list';
  onVideoClick: (videoId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  viewMode,
  onVideoClick,
  onLoadMore,
  hasMore,
  isLoadingMore
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  React.useEffect(() => {
    if (inView && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoadingMore, onLoadMore]);

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {videos.map((video) => (
          <VideoListItem
            key={video.id}
            video={video}
            onClick={() => onVideoClick(video.id)}
          />
        ))}
        {hasMore && (
          <div ref={ref} className="flex justify-center py-4">
            {isLoadingMore && (
              <div className="text-secondary-600 dark:text-secondary-400">
                Loading more videos...
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoGridItem
          key={video.id}
          video={video}
          onClick={() => onVideoClick(video.id)}
        />
      ))}
      {hasMore && (
        <div ref={ref} className="col-span-full flex justify-center py-4">
          {isLoadingMore && (
            <div className="text-secondary-600 dark:text-secondary-400">
              Loading more videos...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface VideoItemProps {
  video: Video;
  onClick: () => void;
}

const VideoGridItem: React.FC<VideoItemProps> = ({ video, onClick }) => {
  return (
    <div
      className="video-item group cursor-pointer bg-white dark:bg-secondary-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-secondary-100 dark:bg-secondary-800">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-secondary-900 ml-1" />
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-secondary-900 dark:text-white mb-1 line-clamp-2">
          {video.title}
        </h3>
        
        <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-400 space-x-3">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatRelativeTime(video.upload_date)}</span>
          </div>
        </div>

        {/* AI Tags */}
        {video.ai_tags && video.ai_tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {video.ai_tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {video.ai_tags.length > 3 && (
              <span className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 text-xs rounded-full">
                +{video.ai_tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const VideoListItem: React.FC<VideoItemProps> = ({ video, onClick }) => {
  return (
    <div
      className="group cursor-pointer bg-white dark:bg-secondary-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative w-48 h-32 bg-secondary-100 dark:bg-secondary-800 flex-shrink-0">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="w-5 h-5 text-secondary-900 ml-1" />
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <h3 className="font-medium text-secondary-900 dark:text-white mb-2">
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3 line-clamp-2">
            {video.description}
          </p>
        )}
        
        <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-400 space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatRelativeTime(video.upload_date)}</span>
          </div>
          
          {video.duration && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(video.duration)}</span>
            </div>
          )}
        </div>

        {/* AI Tags */}
        {video.ai_tags && video.ai_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {video.ai_tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {video.ai_tags.length > 5 && (
              <span className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 text-xs rounded-full">
                +{video.ai_tags.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
