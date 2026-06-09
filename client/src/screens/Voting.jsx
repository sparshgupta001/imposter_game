import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const AVATAR_COLORS = [
  'from-accent to-accent-light',
  'from-neon-blue to-neon-purple',
  'from-neon-green to-neon-blue',
  'from-neon-purple to-neon-pink',
  'from-yellow-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-fuchsia-500 to-pink-500',
  'from-sky-400 to-indigo-500',
];

function CountdownRing({ timeLeft, totalTime }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const dashOffset = circumference * (1 - progress);

  const getColor = () => {
    if (progress > 0.5) return '#10b981';
    if (progress > 0.25) return '#f59e0b';
    return '#e94560';
  };

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="countdown-ring w-16 h-16" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="3"
        />
        <circle
          className="progress"
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="absolute text-lg font-bold text-gray-800 font-mono">{timeLeft}</span>
    </div>
  );
}

export default function Voting() {
  const { timer, players, playerId, submitVote, hasVoted, votedPlayers } = useGame();
  const [selectedId, setSelectedId] = useState(null);
  const totalTime = 45;

  const otherPlayers = players.filter((p) => p.id !== playerId);

  const handleSelect = (id) => {
    if (hasVoted) return;
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleLockIn = () => {
    if (!selectedId || hasVoted) return;
    submitVote(selectedId);
  };

  return (
    <div className="w-full h-full flex flex-col items-center px-6 py-8 overflow-y-auto">
      {/* Timer */}
      <div className="mb-4 animate-fade-in">
        <CountdownRing timeLeft={timer} totalTime={totalTime} />
      </div>

      {/* Header */}
      <div className="text-center mb-6 animate-slide-up">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Vote for the Imposter!</h2>
        <p className="text-gray-500 text-sm">
          {hasVoted ? 'Vote locked in ✓' : 'Select who you think is faking it'}
        </p>
      </div>

      {/* Player Grid */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {otherPlayers.map((player, i) => {
          const isSelected = selectedId === player.id;
          const playerIndex = players.findIndex((p) => p.id === player.id);
          const colorClass = AVATAR_COLORS[playerIndex % AVATAR_COLORS.length];
          const initials = player.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          const hasPlayerVoted = votedPlayers.includes(player.id);

          return (
            <button
              key={player.id}
              onClick={() => handleSelect(player.id)}
              disabled={hasVoted}
              className={`glass-card p-4 flex flex-col items-center gap-2 transition-all duration-200 relative cursor-pointer disabled:cursor-default ${
                isSelected
                  ? 'border-accent/60 bg-accent/5 scale-[1.03] shadow-md shadow-accent/10'
                  : hasVoted
                  ? 'opacity-60'
                  : 'hover:border-gray-300 active:scale-[0.97]'
              }`}
            >
              {/* Selected ring */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl border-2 border-accent animate-pulse-ring pointer-events-none" />
              )}

              {/* Has voted indicator */}
              {hasPlayerVoted && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                  <span className="text-neon-green text-[10px]">✓</span>
                </div>
              )}

              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md`}
              >
                {initials}
              </div>
              <span className="text-sm text-gray-700 font-medium truncate w-full text-center">
                {player.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Vote status */}
      {votedPlayers.length > 0 && (
        <div className="w-full max-w-sm mb-4 animate-fade-in">
          <p className="text-xs text-gray-400 text-center">
            {votedPlayers.length}/{players.length} votes locked in
          </p>
        </div>
      )}

      {/* Lock In Button */}
      {!hasVoted ? (
        <div className="w-full max-w-sm mt-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={handleLockIn}
            disabled={!selectedId}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 active:scale-[0.98] ${
              selectedId
                ? 'bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/25'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedId ? 'Lock In Vote 🔒' : 'Select a player'}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm mt-auto text-center animate-scale-in">
          <div className="glass-card px-5 py-4">
            <p className="text-neon-green font-semibold text-sm">Vote Locked In ✓</p>
            <p className="text-gray-400 text-xs mt-1">Waiting for others...</p>
            <div className="thinking-dots flex justify-center gap-1 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}