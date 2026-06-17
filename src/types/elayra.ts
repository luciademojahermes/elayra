export interface ElayraContext {
  userName?: string;
  daysSinceStart?: number;
  primarySymbol?: 'dot' | 'circle' | 'triangle';
  ritualPhase?: 'morning' | 'evening' | 'manifestation' | 'free' | 'forge';
  streakDays?: number;
  lastRitual?: string;
  emotionalDimensions?: {
    openness: number;
    vulnerability: number;
    groundedness: number;
    creativity: number;
    connectionNeed: number;
    transformationReadiness: number;
  };
  symbolAffinity?: {
    dot: number;
    circle: number;
    triangle: number;
  };
  recentThemes?: string[];
  currentMapNode?: string;
  unlockedNodesCount?: number;
  nextNodeHint?: string;
  pendingInvites?: number;
  activeSpacesCount?: number;
  timeOfDay?: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  moonPhase?: 'new' | 'waxing' | 'full' | 'waning';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'elayra';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ElayraResponse {
  response: string;
  model: string;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
}