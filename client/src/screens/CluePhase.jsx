import React, { useState } from 'react';
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

export default function CluePhase() {
  const { timer, submitClue, hasSubmittedClue, clues, players, playerId } = useGame();
  const [clueText, setClueText] = useState('');

  const handleSubmit = () => {
    const trimmed = clueText.trim();
    if (!trimmed || hasSubmittedClue) return;
    submitClue(trimmed);
    setClueText('');
  };

  const handleClueChange = (e) => {
    const val = e.target.value.replace(/\s/g, '').slice(0, 20);
    setClueText(val);
  };

  const totalTime = 60;
  const submittedIds = clues.map((c) => c.playerId);

  return (
    <div className="w-full h-full flex flex-col items-center px-6 py-8 overflow-y-auto">
      {/* Timer */}
      <div className="mb-6 animate-fade-in">
        <CountdownRing timeLeft={timer} totalTime={totalTime} />
      </div>

      {/* Instruction */}
      <div className="text-center mb-6 animate-slide-up">
        <h2 className="text-xl font-bold text-white mb-1">Give a One-Word Clue</h2>
        <p className="text-gray-400 text-sm">
          Related to the topic — but don&apos;t make it too obvious!
        </p>
      </div>

      {/* Clue Input */}
      {!hasSubmittedClue ? (
        <div className="w-full max-w-sm space-y-3 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <input
            type="text"
            value={clueText}
            onChange={handleClueChange}
            placeholder="Your clue..."
            maxLength={20}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-xl font-semibold placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-gray-500">No spaces allowed</span>
            <span className="text-[10px] text-gray-500">{clueText.length}/20</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!clueText.trim()}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-accent to-accent-light transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-lg hover:shadow-accent/25"
          >
            Submit Clue
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm mb-8 animate-scale-in">
          <div className="glass-card p-4 text-center">
            <p className="text-neon-green text-sm font-medium mb-1">Clue submitted! ✓</p>
            <p className="text-white text-lg font-bold">
              {clues.find((c) => c.playerId === playerId)?.clue || '...'}
            </p>
          </div>
        </div>
      )}

      {/* Players Status */}
      <div className="w-full max-w-sm space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Clues
        </h3>
        <div className="space-y-2 stagger-children">
          {players.map((player) => {
            const playerClue = clues.find((c) => c.playerId === player.id);
            const hasSubmitted = submittedIds.includes(player.id);
            const isSelf = player.id === playerId;

            return (
              <div
                key={player.id}
                className={`glass-card px-4 py-3 flex items-center justify-between transition-all duration-300 ${
                  hasSubmitted ? 'border-neon-green/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      hasSubmitted ? 'bg-neon-green' : 'bg-gray-600'
                    }`}
                  />
                  <span className="text-sm text-gray-300 font-medium">
                    {player.name}
                    {isSelf && (
                      <span className="text-[10px] text-gray-600 ml-1">(you)</span>
                    )}
                  </span>
                </div>
                <div className="text-sm">
                  {hasSubmitted ? (
                    <span className="text-white font-semibold">{playerClue?.clue}</span>
                  ) : (
                    <span className="thinking-dots text-gray-500">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 mx-0.5" />
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 mx-0.5" />
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 mx-0.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
