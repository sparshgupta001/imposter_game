import React from 'react';
import { useGame } from '../context/GameContext';

function CountdownRing({ timeLeft, totalTime }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const dashOffset = circumference * (1 - progress);

  const getColor = () => {
    if (progress > 0.5) return '#00ff88';
    if (progress > 0.25) return '#fbbf24';
    return '#e94560';
  };

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="countdown-ring w-24 h-24" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="4"
        />
        <circle
          className="progress"
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="absolute text-2xl font-bold text-white font-mono">{timeLeft}</span>
    </div>
  );
}

export default function Discussion() {
  const { timer, clues, players } = useGame();
  const totalTime = 60;

  return (
    <div className="w-full h-full flex flex-col items-center px-6 py-8 overflow-y-auto">
      {/* Timer */}
      <div className="mb-6 animate-fade-in">
        <CountdownRing timeLeft={timer} totalTime={totalTime} />
      </div>

      {/* Header */}
      <div className="text-center mb-6 animate-slide-up">
        <h2 className="text-2xl font-bold text-white mb-1">Discuss! 🗣️</h2>
        <p className="text-gray-400 text-sm">Who is the imposter?</p>
      </div>

      {/* Animated speaking indicator */}
      <div className="mb-8 animate-float">
        <div className="flex items-center gap-2">
          <div className="w-3 h-8 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-12 bg-accent-light rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
          <div className="w-3 h-6 bg-neon-pink rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="w-3 h-14 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.45s' }} />
          <div className="w-3 h-8 bg-accent-light rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="w-3 h-10 bg-neon-pink rounded-full animate-pulse" style={{ animationDelay: '0.75s' }} />
          <div className="w-3 h-5 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.9s' }} />
        </div>
      </div>

      {/* Clues Reference */}
      <div className="w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
          Submitted Clues
        </h3>
        <div className="space-y-2 stagger-children">
          {clues.map((clue) => {
            const player = players.find((p) => p.id === clue.playerId);
            return (
              <div key={clue.playerId} className="glass-card px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-300 font-medium">
                  {player?.name || clue.playerName}
                </span>
                <span className="text-white font-bold text-sm">{clue.clue}</span>
              </div>
            );
          })}
        </div>

        {clues.length === 0 && (
          <div className="glass-card p-6 text-center">
            <p className="text-gray-500 text-sm">No clues yet</p>
          </div>
        )}
      </div>

      {/* Instruction */}
      <div className="mt-auto pt-6 text-center animate-fade-in">
        <div className="glass-card px-5 py-3 inline-block">
          <p className="text-gray-300 text-sm">
            Talk it out with your group! 
            <br />
            <span className="text-gray-500 text-xs">Voting starts when the timer ends</span>
          </p>
        </div>
      </div>
    </div>
  );
}
