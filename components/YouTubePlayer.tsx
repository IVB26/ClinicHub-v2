'use client';

interface YouTubePlayerProps {
  videoId: string;
  width?: string;
  title?: string;
}

export function YouTubePlayer({
  videoId,
  width = '100%',
  title = 'YouTube video player',
}: YouTubePlayerProps) {
  return (
    <div style={{ maxWidth: width }} className="w-full">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-200"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
