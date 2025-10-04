import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from 'react-query';
import { apiHelpers } from '../lib/api';
import { isValidVideoFile, formatFileSize } from '../lib/utils';
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Video,
  Loader
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VideoUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onClose, onSuccess }) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  const uploadMutation = useMutation(
    (files: File[]) => apiHelpers.uploadVideo(files, (progress) => {
      // Update progress for all files
      setUploadFiles(prev => prev.map(f => ({
        ...f,
        progress: progress
      })));
    }),
    {
      onSuccess: (data) => {
        // Update file statuses based on results
        setUploadFiles(prev => prev.map(file => {
          const result = data.data.results.find((r: any) => 
            r.filename === file.file.name || r.success
          );
          return {
            ...file,
            status: result?.success ? 'success' : 'error',
            error: result?.error
          };
        }));
        
        const successCount = data.data.results.filter((r: any) => r.success).length;
        if (successCount > 0) {
          toast.success(`${successCount} video(s) uploaded successfully!`);
          onSuccess();
        }
      },
      onError: (error: any) => {
        setUploadFiles(prev => prev.map(file => ({
          ...file,
          status: 'error',
          error: error.message || 'Upload failed'
        })));
        toast.error('Upload failed. Please try again.');
      }
    }
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending' as const
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    },
    maxFiles: 5,
    maxSize: 100 * 1024 * 1024, // 100MB
    validator: (file) => {
      if (!isValidVideoFile(file)) {
        return {
          code: 'invalid-file-type',
          message: 'Only video files are allowed'
        };
      }
      return null;
    }
  });

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    const files = uploadFiles.map(f => f.file);
    
    // Update status to uploading
    setUploadFiles(prev => prev.map(f => ({
      ...f,
      status: 'uploading' as const
    })));

    uploadMutation.mutate(files);
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
  const uploadingFiles = uploadFiles.filter(f => f.status === 'uploading');
  const completedFiles = uploadFiles.filter(f => f.status === 'success' || f.status === 'error');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-800">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
            Upload Videos
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Drop Zone */}
          {pendingFiles.length === 0 && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-secondary-300 dark:border-secondary-700 hover:border-primary-400 dark:hover:border-primary-600'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                {isDragActive ? 'Drop videos here' : 'Drag & drop videos here'}
              </p>
              <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                or click to select files
              </p>
              <p className="text-sm text-secondary-500 dark:text-secondary-500">
                Supports MP4, AVI, MOV, WMV, FLV, WebM, MKV (max 100MB each)
              </p>
            </div>
          )}

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              {/* Pending Files */}
              {pendingFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Video className="w-8 h-8 text-secondary-400" />
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {file.file.name}
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {formatFileSize(file.file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-secondary-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {/* Uploading Files */}
              {uploadingFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {file.file.name}
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        Uploading... {file.progress}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              ))}

              {/* Completed Files */}
              {completedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-4 rounded-lg ${
                    file.status === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {file.status === 'success' ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {file.file.name}
                      </p>
                      <p className={`text-sm ${
                        file.status === 'success'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {file.status === 'success' ? 'Uploaded successfully' : file.error}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200 dark:border-secondary-800">
          <button
            onClick={onClose}
            className="btn-secondary btn-md"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={pendingFiles.length === 0 || uploadMutation.isLoading}
            className="btn-primary btn-md"
          >
            {uploadMutation.isLoading ? 'Uploading...' : `Upload ${pendingFiles.length} Video${pendingFiles.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};
