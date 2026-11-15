import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types/ai';
import { sendChatMessage } from '../services/api';

export function usePlantChat(plantId: string | undefined, growthStage: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!plantId || !text.trim()) return;

      const userMessage: ChatMessage = { role: 'user', text: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        const res = await sendChatMessage({
          plant_id: plantId,
          growth_stage: growthStage,
          message: text.trim(),
          conversation_history: [...messages, userMessage],
        });

        if (res.success) {
          setMessages((prev) => [...prev, { role: 'model', text: res.data.reply }]);
        } else {
          setError(res.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chat failed');
      } finally {
        setLoading(false);
      }
    },
    [plantId, growthStage, messages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearChat };
}
