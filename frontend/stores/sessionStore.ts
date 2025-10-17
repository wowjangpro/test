import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  sessionId: string;
  generateSessionId: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: '',
      generateSessionId: () => {
        const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        set({ sessionId: newSessionId });
      },
    }),
    {
      name: 'whisperboard-session',
      onRehydrateStorage: () => (state) => {
        if (!state?.sessionId) {
          state?.generateSessionId();
        }
      },
    }
  )
);
