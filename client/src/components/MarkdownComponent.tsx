import { LLMOutputComponent } from "@llm-ui/react";

export const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
  const content = blockMatch.output as string;
  
  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    // Handle headers
    if (text.startsWith('###')) {
      return <h3 className="text-lg font-semibold mt-4 mb-2">{text.replace(/^###\s*/, '')}</h3>;
    }
    if (text.startsWith('##')) {
      return <h2 className="text-xl font-semibold mt-4 mb-2">{text.replace(/^##\s*/, '')}</h2>;
    }
    if (text.startsWith('#')) {
      return <h1 className="text-2xl font-bold mt-4 mb-2">{text.replace(/^#\s*/, '')}</h1>;
    }
    
    // Handle bold text
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(boldRegex);
    
    return (
      <p className="mb-2">
        {parts.map((part, index) => 
          index % 2 === 1 ? <strong key={index} className="font-semibold">{part}</strong> : part
        )}
      </p>
    );
  };
  
  return (
    <div className="prose prose-sm max-w-none">
      {content.split('\n').filter(line => line.trim()).map((line, index) => (
        <div key={index}>{renderContent(line)}</div>
      ))}
    </div>
  );
};