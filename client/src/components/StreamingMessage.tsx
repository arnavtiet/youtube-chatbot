import { useLLMOutput } from "@llm-ui/react";
import {
  codeBlockLookBack,
  findCompleteCodeBlock,
  findPartialCodeBlock,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";
import { CodeBlock } from "./CodeBlock";
import { MarkdownComponent } from "./MarkdownComponent";
import { MarkdownMessage } from "./MarkdownMessage";
import { User, Bot } from "lucide-react";

interface StreamingMessageProps {
  role: "user" | "bot";
  content: string;
  isStreaming?: boolean;
  isStreamFinished?: boolean;
}

export const StreamingMessage = ({ 
  role, 
  content, 
  isStreaming, 
  isStreamFinished 
}: StreamingMessageProps) => {  return (
    <div className={`flex gap-3 mb-6 ${role === "user" ? "justify-end" : ""}`}>
      {role === "bot" && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <Bot className="w-4 h-4 text-black" />
        </div>
      )}
      
      <div 
        className={`max-w-[85%] ${
          role === "user" 
            ? "ml-auto" 
            : ""
        }`}
      >
        {role === "user" ? (
          <div className="bg-white text-black rounded-lg p-4">
            <p className="text-sm">{content}</p>
          </div>
        ) : (
          <MarkdownMessage 
            content={content || (isStreaming ? "" : "...")} 
            isStreaming={isStreaming}
          />
        )}
      </div>
      
      {role === "user" && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <User className="w-4 h-4 text-black" />
        </div>
      )}
    </div>
  );
};