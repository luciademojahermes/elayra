# Elayra Frontend (Expo + React Native)

App mobile per **Elayra** — compagna AI sacra per crescita personale.

---

## 🎯 Panoramica

App React Native + Expo + TypeScript con:
- Chat streaming (SSE) con Elayra
- Markdown rendering (grassetto, corsivo, simboli)
- Stato chat persistito (Zustand)
- UI dark theme, somatic-friendly
- Input con auto-focus, invio tasto "invio"
- Indicatori: "Sto pensando...", streaming ●

---

## 📁 Struttura

```
elayra/
├── App.tsx                    # Entry point
├── src/
│   ├── screens/
│   │   └── ChatScreen.tsx     # Schermata chat principale
│   ├── hooks/
│   │   └── useElayraChat.ts   # Hook logica chat + streaming
│   ├── services/
│   │   └── elayraApi.ts       # Client API (con reminder italiano)
│   ├── store/
│   │   └── chatStore.ts       # Zustand store (messaggi, context, streaming)
│   ├── types/
│   │   └── elayra.ts          # Tipi TypeScript
│   └── constants/             # Costanti (futuro)
├── app.json                   # Config Expo
├── package.json
└── tsconfig.json
```

---

## ⚙️ Configurazione

### Variabili d'ambiente (in `elayraApi.ts`)
```typescript
const API_BASE = 'https://establishing-know-log-technician.trycloudflare.com';
```

### Requisiti
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Backend running su `http://localhost:3002` (o tunnel)

---

## 🚀 Avvio

```bash
# Installa dipendenze
npm install

# Avvia Expo (web per test rapido)
npx expo start --web

# Oppure avvia con tunnel per telefono
npx expo start --tunnel
```

### Test su telefono
1. Installa **Expo Go** (iOS/Android)
2. `npx expo start --tunnel`
3. Scannerizza QR code con Expo Go

---

## 📦 Dipendenze Principali

```json
{
  "expo": "~56.0.0",
  "react": "18.2.x",
  "react-native": "0.79.x",
  "zustand": "^4.5.x",
  "@tanstack/react-query": "^5.x",
  "react-native-markdown-display": "^7.x",
  "expo-av": "~15.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "expo-linear-gradient": "~14.x",
  "expo-blur": "~14.x",
  "expo-haptics": "~14.x",
  "expo-notifications": "~0.28.x",
  "expo-symbols": "~0.2.x"
}
```

---

## 🏗 Architettura

### Flusso Messaggio
```
User Input → sendMessage()
    ↓
elayaApi.streamMessage() → POST /api/elayra/chat (con reminder italiano)
    ↓
SSE Stream → yield delta → updateLastMessage() (Zustand)
    ↓
ChatScreen re-render → Markdown + Streaming indicator
```

### Stato (Zustand `chatStore`)
```typescript
{
  messages: ChatMessage[],      // [{id, role, content, timestamp, isStreaming}]
  isStreaming: boolean,         // true durante generazione
  context: ElayraContext,       // nome, simbolo, fase, stato emotivo
  
  addMessage(msg),
  updateLastMessage(content),
  setStreaming(bool),
  setContext(partial),
  clearMessages()
}
```

### Hook `useElayraChat`
```typescript
const { 
  messages, 
  isStreaming, 
  sendMessage, 
  stopStreaming, 
  updateContext, 
  context 
} = useElayraChat();
```

---

## 🎨 UI Components

### ChatScreen
- Header: simbolo △ + titolo "Elayra" + fase rituale
- Messaggi: bolle differenziate user/Elayra
- Welcome state (quando messaggi vuoti)
- Streaming indicator: "Sto pensando..." → ●
- Input: multiline, max 2000 char, auto-focus

### Stili (Dark Theme)
| Elemento | Colore |
|----------|--------|
| Background | `#0a0a0f` |
| User bubble | `#1e2a3a` |
| Elayra bubble | `#1a1a2e` + border left gold |
| Testo primario | `#f5f0e8` |
| Testo secondario | `#c0b8a8` |
| Accento/Simboli | `#e8d5b7` |
| Streaming ● | `#e8d5b7` |

---

## 🔌 API Client (`elayraApi.ts`)

### Iniezione Reminder Automatica
Ogni messaggio utente ha appended:
```
\n\n[SISTEMA: Rispondi ESCLUSIVAMENTE in italiano. Mai altre lingue.]
```

### Endpoints
```typescript
elayraApi.streamMessage(message, context, history)  // AsyncGenerator<string>
elayraApi.sendMessage(message, context, history)    // Promise<string>
elayraApi.healthCheck()                             // Promise<{status, model}>
elayraApi.getModelInfo()                            // Promise<ModelInfo>
```

### Base URL
```typescript
const API_BASE = 'https://establishing-know-log-technician.trycloudflare.com';
```

---

## 📱 Test su Telefono

### Opzione 1: Expo Go + Tunnel (consigliato)
```bash
npx expo start --tunnel
# Scannerizza QR con Expo Go
```

### Opzione 2: Browser Web (stessa rete WiFi)
```bash
npx expo start --web
# Apri http://<IP_PC>:8082 su telefono
```

### Opzione 3: Build APK (Android)
```bash
npx expo run:android
# Richiede Android Studio + device USB
```

---

## 🎯 Flusso Test Completo

1. **Avvia backend**: `cd elayra-backend && npm start`
2. **Avvia frontend**: `cd elayra && npx expo start --tunnel`
3. **Telefono**: Apri Expo Go → Scannerizza QR
4. **Test chat**:
   - "Ciao, sono Marco" → Elayra saluta Marco
   - "Mi sento ansioso" → Elayra ricorda Marco, chiede "Dove lo senti?"
   - "Sento nodo alla gola" → Elayra collega ad ansia precedente

---

## 🐛 Debug Comuni

| Problema | Soluzione |
|----------|-----------|
| Metro non parte | `npx expo start --clear` |
| Tunnel non funziona | `npx expo start --tunnel --port 8083` |
| API non raggiungibile | Verifica `API_BASE` in `elayraApi.ts` |
| Markdown non renderizza | `npm install react-native-markdown-display` |
| Tipo `AsyncGenerator` errore | `"target": "ES2020"` in `tsconfig.json` |
| Warning `useElayraChat` deps | Aggiungi `streamingContent` nel `useCallback` |

---

## 📝 tip

### Cambiare URL Backend
Modifica `API_BASE` in `src/services/elayraApi.ts`:
```typescript
const API_BASE = 'https://tuo-tunnel.trycloudflare.com';
```

### Aggiungere AsyncStorage (persistenza)
```typescript
// In chatStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist } from 'zustand/middleware';

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({ ... }),
    { name: 'elayra-chat', storage: { getItem: ..., setItem: ..., removeItem: ... } }
  )
);
```

---

## 📦 Build Produzione

```bash
# EAS Build (consigliato)
npm install -g eas-cli
eas build --platform android
eas build --platform ios

# Oppure classic
expo build:android
expo build:ios
```

---

## 📄 Licenza

Progetto Elayra — Uso interno team.