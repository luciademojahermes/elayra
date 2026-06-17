import { ChatMessage, ElayraContext } from '../types/elayra';
import { create } from 'zustand';

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  context: ElayraContext;
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (val: boolean) => void;
  setContext: (ctx: Partial<ElayraContext>) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  context: {
    // userName RIMOSSO - Elayra lo chiederà se non c'è
    primarySymbol: 'triangle',
    ritualPhase: 'free',
    streakDays: 0,
    emotionalDimensions: {
      openness: 70,
      vulnerability: 50,
      groundedness: 65,
      creativity: 80,
      connectionNeed: 45,
      transformationReadiness: 70,
    },
    symbolAffinity: { dot: 25, circle: 30, triangle: 45 },
  },

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  
  updateLastMessage: (content, streaming = true) => set((state) => {
    const msgs = [...state.messages];
    if (msgs.length > 0) {
      msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content, isStreaming: streaming };
    }
    return { messages: msgs };
  }),
  
  setStreaming: (val) => set({ isStreaming: val }),
  
  setContext: (ctx) => set((state) => ({ context: { ...state.context, ...ctx } })),
  
  clearMessages: () => set({ messages: [] }),
}));