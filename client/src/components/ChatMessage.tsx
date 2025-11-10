import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "bot";
  content: string;
  isLoading?: boolean;
}

export const ChatMessage = ({ role, content, isLoading }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-glow-primary border",
          isUser ? "bg-primary/10 border-primary/30" : "bg-secondary/10 border-secondary/30"
        )}
      >
        {isUser ? <User className="h-5 w-5 text-primary" /> : <Bot className="h-5 w-5 text-secondary" />}
      </div>
      <div
        className={cn(
          "flex-1 space-y-2 overflow-hidden rounded-lg px-4 py-3 border",
          isUser ? "bg-card/50 border-border/50 backdrop-blur-sm" : "bg-muted/50 border-border/50 backdrop-blur-sm"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce shadow-glow-primary" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce shadow-glow-primary" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce shadow-glow-primary" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
};
