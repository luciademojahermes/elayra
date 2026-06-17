import { useCallback, useRef } from 'react';
import { ChatMessage, ElayraContext } from '../types/elayra';
import { elayraApi } from '../services/elayraApi';
import { useChatStore } from '../store/chatStore';

export function useElayraChat() {
  const { messages, isStreaming, context, addMessage, updateLastMessage, setStreaming, setContext } = useChatStore();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (isStreaming || !text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setStreaming(true);

    const elayraMsg: ChatMessage = {
      id: `elayra-${Date.now()}`,
      role: 'elayra',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    addMessage(elayraMsg);

    abortRef.current = new AbortController();
    let fullContent = '';

    try {
      for await (const delta of elayraApi.streamMessage(text, context, messages)) {
        if (abortRef.current?.signal.aborted) break;
        fullContent += delta;
        updateLastMessage(fullContent);
      }
    } catch (err) {
      console.error('Stream error:', err);
      updateLastMessage('Scusa, qualcosa è andato storto. Riprova? 🌿');
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming, context, messages, addMessage, updateLastMessage, setStreaming]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, [setStreaming]);

  const updateContext = useCallback((ctx: Partial<ElayraContext>) => {
    setContext(ctx);
  }, [setContext]);

  return { messages, isStreaming, sendMessage, stopStreaming, updateContext, context };
}