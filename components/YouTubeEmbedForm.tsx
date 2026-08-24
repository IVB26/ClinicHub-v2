'use client';

import { useState, useEffect } from 'react';
import { YouTubePlayer } from './YouTubePlayer';

interface YouTubeEmbedFormProps {
  videoUrl: string;
  videoId: string;
  thumbnail: string;
  youtubeWidth: string;
  onUrlChange: (url: string) => void;
  onVideoIdChange: (id: string) => void;
  onThumbnailChange: (thumbnail: string) => void;
  onWidthChange: (width: string) => void;
  disabled?: boolean;
}

export function YouTubeEmbedForm({
  videoUrl,
  videoId,
  thumbnail,
  youtubeWidth,
  onUrlChange,
  onVideoIdChange,
  onThumbnailChange,
  onWidthChange,
  disabled = false,
}: YouTubeEmbedFormProps) {
  const [error, setError] = useState('');
  const [customWidth, setCustomWidth] = useState('100');

  const extractVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleUrlChange = (url: string) => {
    onUrlChange(url);
    setError('');

    if (url.trim()) {
      const id = extractVideoId(url);
      if (!id) {
        setError(
          'Invalid YouTube URL. Try: youtube.com/watch?v=... or youtu.be/...'
        );
        onVideoIdChange('');
        onThumbnailChange('');
      } else {
        onVideoIdChange(id);
        const thumbUrl = getThumbnailUrl(id);
        onThumbnailChange(thumbUrl);
      }
    }
  };

  const handleCustomWidthChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 10 && numValue <= 100) {
      setCustomWidth(value);
      onWidthChange(`${value}%`);
    }
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          YouTube URL
        </label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
        />
        {error && <p className="text-sm text-red-600 mt-1">⚠️ {error}</p>}
      </div>

      {/* Size Controls */}
      {videoId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onWidthChange('50%')}
              disabled={disabled}
              className={`px-3 py-2 rounded text-sm font-medium border transition ${
                youtubeWidth === '50%'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 disabled:bg-gray-100'
              }`}
            >
              Small (50%)
            </button>
            <button
              type="button"
              onClick={() => onWidthChange('75%')}
              disabled={disabled}
              className={`px-3 py-2 rounded text-sm font-medium border transition ${
                youtubeWidth === '75%'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 disabled:bg-gray-100'
              }`}
            >
              Medium (75%)
            </button>
            <button
              type="button"
              onClick={() => onWidthChange('100%')}
              disabled={disabled}
              className={`px-3 py-2 rounded text-sm font-medium border transition ${
                youtubeWidth === '100%'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 disabled:bg-gray-100'
              }`}
            >
              Large (100%)
            </button>
            <div className="flex gap-1">
              <input
                type="number"
                min="10"
                max="100"
                value={customWidth}
                onChange={(e) => handleCustomWidthChange(e.target.value)}
                disabled={disabled}
                className="flex-1 px-2 py-2 border border-gray-300 rounded-l text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Custom"
              />
              <div className="px-2 py-2 border border-l-0 border-gray-300 rounded-r bg-gray-50 text-gray-600 text-sm">
                %
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Preview */}
      {thumbnail && videoId && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <img
            src={thumbnail}
            alt="YouTube video thumbnail"
            className="w-full h-auto rounded-lg border border-gray-200 max-h-64 object-cover"
          />
        </div>
      )}

      {/* Video Preview */}
      {videoId && !error && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Video Preview:</p>
          <YouTubePlayer videoId={videoId} width={youtubeWidth} />
        </div>
      )}

      {/* Empty State */}
      {!videoId && !error && (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-sm text-gray-500">Enter a YouTube URL to preview</p>
        </div>
      )}
    </div>
  );
}
