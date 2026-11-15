import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import type { ChatMessage } from '../../types/ai';

interface ChatAssistantProps {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  onClear: () => void;
  plantName: string;
}

export function ChatAssistant({
  messages,
  loading,
  error,
  onSendMessage,
  onClear,
  plantName,
}: ChatAssistantProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <Card
      title={`Ask About Your ${plantName}`}
      headerAction={
        messages.length > 0 ? (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="space-y-3">
        {/* Message History */}
        <div className="h-64 overflow-y-auto space-y-3 px-1">
          {messages.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              <Bot className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Ask me anything about your {plantName}!</p>
              <p className="text-xs mt-1 text-gray-300">
                e.g., "Why are the leaves turning yellow?"
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'model' && (
                <div className="p-1.5 bg-emerald-100 rounded-full shrink-0">
                  <Bot className="h-3.5 w-3.5 text-emerald-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="p-1.5 bg-gray-200 rounded-full shrink-0">
                  <User className="h-3.5 w-3.5 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-emerald-100 rounded-full shrink-0">
                <Bot className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about your ${plantName}...`}
            maxLength={2000}
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50"
          />
          <Button type="submit" disabled={!input.trim() || loading} size="md">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
