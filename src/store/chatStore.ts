import { ChatMessage, ElayraContext } from '../types/elayra';
import { create } from 'zustand';
import { loadMessages, saveMessages, loadContext, saveContext } from '../services/storage';

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  context: ElayraContext;
  isLoading: boolean;
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string, streaming?: boolean) => void;
  setStreaming: (val: boolean) => void;
  setContext: (ctx: Partial<ElayraContext>) => void;
  clearMessages: () => void;
  loadPersisted: () => Promise<void>;
}

const DEFAULT_CONTEXT: ElayraContext = {
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
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  context: DEFAULT_CONTEXT,
  isLoading: true,

  addMessage: (msg) => {
    set((state) => {
      const newMessages = [...state.messages, msg];
      saveMessages(newMessages);
      return { messages: newMessages };
    });
  },

  updateLastMessage: (content, streaming = true) => {
    set((state) => {
      const msgs = [...state.messages];
      if (msgs.length > 0) {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content, isStreaming: streaming };
        saveMessages(msgs);
      }
      return { messages: msgs };
    });
  },

  setStreaming: (val) => set({ isStreaming: val }),

  setContext: (ctx) => {
    set((state) => {
      const newContext = { ...state.context, ...ctx };
      saveContext(newContext);
      return { context: newContext };
    });
  },

  clearMessages: () => {
    saveMessages([]);
    set({ messages: [] });
  },

  loadPersisted: async () => {
    try {
      const [messages, context] = await Promise.all([
        loadMessages(),
        loadContext(),
      ]);
      set({
        messages: messages || [],
        context: context || DEFAULT_CONTEXT,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));