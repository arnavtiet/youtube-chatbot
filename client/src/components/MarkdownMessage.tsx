import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownMessage = ({ content, isStreaming }: MarkdownMessageProps) => {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom styling for different markdown elements
            h1: ({ children }) => (
              <h1 className="text-xl font-bold text-white mb-3 mt-2">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold text-white mb-2 mt-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-medium text-white mb-2 mt-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-200 mb-2 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="text-gray-200 mb-3 pl-4 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="text-gray-200 mb-3 pl-4 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-200">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="text-gray-300 italic">{children}</em>
            ),
            code: ({ children }) => (
              <code className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-800 border border-gray-600 rounded-md p-3 overflow-x-auto mb-3">
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-600 pl-4 text-gray-300 italic my-3">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-white/60 animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
};