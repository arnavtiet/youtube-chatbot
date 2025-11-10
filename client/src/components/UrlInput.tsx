import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import { toast } from "sonner";

interface UrlInputProps {
  onSubmit: (url: string) => void | Promise<void>;
  isLoading?: boolean;
}

export const UrlInput = ({ onSubmit, isLoading: externalLoading = false }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);
  
  const isLoading = externalLoading || internalLoading;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setInternalLoading(true);
    
    try {
      await onSubmit(url);
      toast.success("Video loaded successfully!");
      setUrl(""); // Clear the input after successful submission
    } catch (error) {
      toast.error("Failed to load video. Please try again.");
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
        <Input
          type="text"
          placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="pl-12 h-14 text-base bg-card/50 border-border/50 backdrop-blur-sm focus:border-primary/50 focus:shadow-glow-primary transition-all"
        />
      </div>      <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-primary transition-all">
        {isLoading ? "Extracting Transcript..." : "Start Chatting"}
      </Button>
    </form>
  );
};
