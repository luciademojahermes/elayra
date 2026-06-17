import { ElayraContext, ChatMessage, StreamChunk } from '../types/elayra';

const API_BASE = 'https://establishing-know-log-technician.trycloudflare.com';

const ITALIAN_REMINDER = '\n\n[SISTEMA: Rispondi ESCLUSIVAMENTE in italiano. Mai altre lingue.]';

class ElayraApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async healthCheck() {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  }

  private injectReminder(message: string): string {
    return message + ITALIAN_REMINDER;
  }

  async sendMessage(message: string, context: ElayraContext, history: ChatMessage[]): Promise<string> {
    const messageWithReminder = this.injectReminder(message);
    const res = await fetch(`${this.baseUrl}/api/elayra/chat-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageWithReminder,
        context,
        history: history.slice(-20).map(m => ({ role: m.role, content: m.content }))
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error: ${err}`);
    }

    const data = await res.json();
    return data.response;
  }

  async *streamMessage(message: string, context: ElayraContext, history: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    const messageWithReminder = this.injectReminder(message);
    const res = await fetch(`${this.baseUrl}/api/elayra/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageWithReminder,
        context,
        history: history.slice(-20).map(m => ({ role: m.role, content: m.content }))
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Stream error: ${err}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No reader');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data: StreamChunk = JSON.parse(line.slice(6));
          if (data.delta) yield data.delta;
          if (data.done) return;
        } catch (e) {}
      }
    }
  }

  async getModelInfo() {
    const res = await fetch(`${this.baseUrl}/api/elayra/model`);
    return res.json();
  }
}

export const elayraApi = new ElayraApiService();