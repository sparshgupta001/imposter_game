import React, { useState, useEffect } from 'react';
import { useGame } from './context/GameContext';
import Home from './screens/Home';
import Lobby from './screens/Lobby';
import RoleReveal from './screens/RoleReveal';
import CluePhase from './screens/CluePhase';
import Discussion from './screens/Discussion';
import Voting from './screens/Voting';
import Results from './screens/Results';

function ToastOverlay() {
  const { toasts } = useGame();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none pt-4 gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-5 py-3 rounded-xl text-sm font-medium shadow-lg ${
            toast.exiting ? 'toast-exit' : 'toast-enter'
          } ${
            toast.type === 'warning'
              ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-200'
              : toast.type === 'error'
              ? 'bg-red-500/20 border border-red-500/30 text-red-200'
              : 'bg-neon-blue/10 border border-neon-blue/30 text-neon-blue'
          }`}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function ConnectionIndicator() {
  const { connected } = useGame();

  return (
    <div className="fixed top-3 right-3 z-40 flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full ${
          connected ? 'bg-neon-green animate-pulse' : 'bg-red-500'
        }`}
      />
      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
        {connected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}

const screens = {
  home: Home,
  lobby: Lobby,
  roleReveal: RoleReveal,
  clue: CluePhase,
  discussion: Discussion,
  voting: Voting,
  results: Results,
  finalResults: Results,
};

export default function App() {
  const { phase } = useGame();
  const [displayedPhase, setDisplayedPhase] = useState(phase);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (phase !== displayedPhase) {
      setTransitioning(true);
      const t = setTimeout(() => {
        setDisplayedPhase(phase);
        setTransitioning(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [phase, displayedPhase]);

  const ScreenComponent = screens[displayedPhase] || Home;

  return (
    <div className="w-full h-[100dvh] bg-game-gradient overflow-hidden relative">
      <ConnectionIndicator />
      <ToastOverlay />
      <div
        className={`w-full h-full transition-all duration-300 ease-out ${
          transitioning
            ? 'opacity-0 translate-y-3 scale-[0.98]'
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <ScreenComponent />
      </div>
    </div>
  );
}
