import { Play } from "lucide-react";

interface VideoThumbnailProps {
  videoId: string;
  videoTitle?: string;
}

export const VideoThumbnail = ({ videoId, videoTitle }: VideoThumbnailProps) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className="w-full mb-6 animate-in fade-in slide-in-from-top-4">
      <div className="relative overflow-hidden rounded-lg border border-border/50 shadow-lg group">
        <img src={thumbnailUrl} alt={videoTitle || "YouTube video"} className="w-full h-auto aspect-video object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-4 left-4 right-4 text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium truncate">{videoTitle || "YouTube Video"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
