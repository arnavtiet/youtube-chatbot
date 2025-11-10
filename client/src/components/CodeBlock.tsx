import { LLMOutputComponent } from "@llm-ui/react";

export const CodeBlock: LLMOutputComponent = ({ blockMatch }) => {
  const content = blockMatch.output as string;
  
  return (
    <div className="my-4">
      <div className="bg-muted/50 border border-border rounded-lg overflow-hidden">
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm font-mono text-foreground">{content}</code>
        </pre>
      </div>
    </div>
  );
};