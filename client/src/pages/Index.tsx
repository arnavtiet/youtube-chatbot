import { useState, useRef, useEffect } from "react";
import { UrlInput } from "@/components/UrlInput";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { ChatInput } from "@/components/ChatInput";
import { LimitReachedModal } from "@/components/LimitReachedModal";
import { MessageCircle, Upload, RotateCcw } from "lucide-react";
import transcriptAPI from "@/lib/api";
import { StreamingMessage } from "../components/StreamingMessage";

interface Message {
  role: "user" | "bot";
  content: string;
  isStreaming?: boolean;
  isStreamFinished?: boolean;
}

const MAX_FREE_QUESTIONS = 5;

const Index = () => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingTranscript, setIsExtractingTranscript] = useState(false);
  const [transcriptLoaded, setTranscriptLoaded] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getVideoId = async (url: string) => {
    try {
      const response = await transcriptAPI.extractVideoId(url);
      setVideoId(response.video_id);
      return response.video_id;
    } catch (error) {
      console.error("Error extracting video id:", error);
    }
  };  const handleVideoSubmit = async (id: string) => {
    setIsExtractingTranscript(true);
    setTranscriptLoaded(false);
    try {
      // Construct YouTube URL from video ID
      const url = `https://www.youtube.com/watch?v=${id}`;
      const videoid = await getVideoId(url);
      
      // Extract transcript using the API
      console.log("transcript processing...");
      const response = await transcriptAPI.extractTranscript(url);
      
      setVideoUrl(url);
      setTranscriptLoaded(true);
      setMessages([
        {
          role: "bot",
          content: `Great! I've loaded the video and extracted the transcript. The video has ${response.chunks_count} text chunks. Feel free to ask me any questions about its content. You have ${MAX_FREE_QUESTIONS} free questions to get started.`,
        },
      ]);
    } catch (error) {
      console.error("Error extracting transcript:", error);
      setTranscriptLoaded(false);
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

  const handleReupload = () => {
    // Reset all state hooks
    setVideoId(null);
    setVideoUrl(null);
    setMessages([]);
    setQuestionCount(0);
    setIsLoading(false);
    setIsExtractingTranscript(false);
    setTranscriptLoaded(false);
    setShowLimitModal(false);
  };const handleSendMessage = async (message: string) => {
    if (questionCount >= MAX_FREE_QUESTIONS) {
      setShowLimitModal(true);
      return;
    }

    // Add user message
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setQuestionCount((prev) => prev + 1);
    setIsLoading(true);

    // Add streaming message placeholder
    const streamingMessageIndex = messages.length + 1;
    setMessages((prev) => [...prev, { 
      role: "bot", 
      content: "", 
      isStreaming: true, 
      isStreamFinished: false 
    }]);    try {
      // Call backend API
      const response = await transcriptAPI.sendMessage(message);

      // Simulate streaming effect
      const fullContent = response.answer;
      let currentContent = "";
      
      for (let i = 0; i < fullContent.length; i += 8) {
        currentContent = fullContent.slice(0, i + 8);
        
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "bot",
            content: currentContent,
            isStreaming: i + 8 < fullContent.length,
            isStreamFinished: i + 8 >= fullContent.length
          };
          return newMessages;
        });
        
        // Add small delay for streaming effect
        if (i + 8 < fullContent.length) {
          await new Promise(resolve => setTimeout(resolve, 15));
        }
      }
      
      // Ensure the complete content is displayed
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "bot",
          content: fullContent,
          isStreaming: false,
          isStreamFinished: true
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
          isStreaming: false,
          isStreamFinished: true
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">AI YouTube Chatbot</h1>
                <p className="text-xs text-gray-400">Intelligent video analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">              {videoId && transcriptLoaded && (
                <button
                  onClick={handleReupload}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-black hover:bg-white rounded-lg transition-colors focus-white"
                  title="Upload new video"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">New Video</span>
                </button>
              )}
              
              {videoId && (
                <div className="text-right">                  <p className="text-sm font-medium text-white">
                    <span className="text-white">{questionCount}</span>/{MAX_FREE_QUESTIONS}
                  </p>
                  <p className="text-xs text-gray-400">{MAX_FREE_QUESTIONS - questionCount} remaining</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">        {!videoId || !transcriptLoaded ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-8 space-y-4">              <div className="mx-auto h-20 w-20 rounded-full bg-white flex items-center justify-center mb-6">
                <MessageCircle className="h-10 w-10 text-black" />
              </div>
              <h2 className="text-4xl font-bold text-white">
                AI YouTube Chatbot
              </h2>              <p className="text-base text-gray-400 max-w-2xl mx-auto">
                Advanced neural network processing for instant video comprehension. Enter any YouTube URL to begin.
              </p>
            </div>
            <UrlInput onSubmit={handleVideoSubmit} isLoading={isExtractingTranscript} />
          </div>
        ) : (          <div className="space-y-6">
            <VideoThumbnail videoId={videoId} />
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 min-h-[400px] max-h-[500px] overflow-y-auto scrollbar-hide">
              {messages.map((message, index) => (
                <StreamingMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  isStreaming={message.isStreaming}
                  isStreamFinished={message.isStreamFinished}
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
