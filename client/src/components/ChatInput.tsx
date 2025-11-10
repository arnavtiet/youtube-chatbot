import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, disabled, placeholder = "Ask a question about this video..." }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
        className="flex-1 h-12 bg-card/50 border-border/50 backdrop-blur-sm focus:border-primary/50 focus:shadow-glow-primary transition-all"
      />
      <Button type="submit" disabled={disabled || !message.trim()} size="icon" className="h-12 w-12 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-primary transition-all">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};
