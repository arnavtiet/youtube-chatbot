import { useState, useRef, useEffect } from "react";
import { UrlInput } from "@/components/UrlInput";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { LimitReachedModal } from "@/components/LimitReachedModal";
import { MessageCircle } from "lucide-react";
import transcriptAPI from "@/lib/api";

interface Message {
  role: "user" | "bot";
  content: string;
}

const MAX_FREE_QUESTIONS = 5;

const Index = () => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingTranscript, setIsExtractingTranscript] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleVideoSubmit = async (id: string) => {
    setIsExtractingTranscript(true);
    try {
      // Construct YouTube URL from video ID
      const url = `https://www.youtube.com/watch?v=${id}`;
      
      // Extract transcript using the API
      console.log("transcript processing...");
      const response = await transcriptAPI.extractTranscript(url);
      
      setVideoId(id);
      setVideoUrl(url);
      setMessages([
        {
          role: "bot",
          content: `Great! I've loaded the video and extracted the transcript. The video has ${response.chunks_count} text chunks. Feel free to ask me any questions about its content. You have ${MAX_FREE_QUESTIONS} free questions to get started.`,
        },
      ]);
    } catch (error) {
      console.error("Error extracting transcript:", error);
      setMessages([
        {
          role: "bot",
          content: "Sorry, I couldn't extract the transcript from this video. Please make sure the URL is valid and the video has captions available.",
        },
      ]);
    } finally {
      setIsExtractingTranscript(false);
    }
  };
  const handleSendMessage = async (message: string) => {
    if (questionCount >= MAX_FREE_QUESTIONS) {
      setShowLimitModal(true);
      return;
    }

    // Add user message
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setQuestionCount((prev) => prev + 1);
    setIsLoading(true);

    // Add loading message
    setMessages((prev) => [...prev, { role: "bot", content: "" }]);

    try {
      // Call backend API
      const response = await transcriptAPI.sendMessage(message);

      // Update bot message with response
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: "bot", 
          content: response.answer 
        };
        return newMessages;
      });

      // Check if limit reached after this question
      if (questionCount + 1 >= MAX_FREE_QUESTIONS) {
        setTimeout(() => {
          setShowLimitModal(true);
        }, 500);
      }
    } catch (error) {
      console.error("Error getting response:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "bot",
          content: "Sorry, I encountered an error. Please try again.",
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow-primary">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI Video Assistant</h1>
              <p className="text-xs text-muted-foreground">Neural-powered video analysis</p>
            </div>
            {videoId && (
              <div className="ml-auto text-right">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-primary">{questionCount}</span>/{MAX_FREE_QUESTIONS}
                </p>
                <p className="text-xs text-muted-foreground">{MAX_FREE_QUESTIONS - questionCount} remaining</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">        {!videoId ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-8 space-y-4">
              <div className="mx-auto h-20 w-20 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-glow-primary">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-4xl font-bold text-foreground">
                AI Video Analysis
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Advanced neural network processing for instant video comprehension. Enter any YouTube URL to begin.
              </p>
            </div>
            <UrlInput onSubmit={handleVideoSubmit} isLoading={isExtractingTranscript} />
          </div>
        ) : (
          <div className="space-y-6">
            <VideoThumbnail videoId={videoId} />
            
            <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  isLoading={isLoading && index === messages.length - 1 && message.content === ""}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="sticky bottom-4">
              <ChatInput
                onSend={handleSendMessage}
                disabled={isLoading || questionCount >= MAX_FREE_QUESTIONS}
                placeholder={
                  questionCount >= MAX_FREE_QUESTIONS
                    ? "Question limit reached"
                    : "Ask a question about this video..."
                }
              />
            </div>
          </div>
        )}
      </main>

      <LimitReachedModal open={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
};

export default Index;
