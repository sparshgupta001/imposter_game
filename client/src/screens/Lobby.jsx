import React, { useState, useCallback } from 'react';
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

const CATEGORIES = [
  { id: 'general', emoji: '🌍', label: 'General', desc: 'For everyone' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'Family', desc: 'Kid-friendly' },
  { id: 'adult', emoji: '🔞', label: 'Adult', desc: '18+ only' },
];

function PlayerAvatar({ player, index, isCurrentPlayer }) {
  const initials = player.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div className={`flex flex-col items-center gap-1.5 animate-scale-in ${!player.connected ? 'opacity-40' : ''}`}>
      <div
        className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md relative`}
      >
        {initials}
        {isCurrentPlayer && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-neon-green border-2 border-white" />
        )}
        {!player.connected && (
          <div className="absolute inset-0 rounded-full bg-gray-300/60 flex items-center justify-center">
            <span className="text-xs">📡</span>
          </div>
        )}
      </div>
      <span className="text-xs text-gray-600 font-medium truncate max-w-[70px] text-center">
        {player.name}
        {isCurrentPlayer && (
          <span className="text-[9px] text-gray-400 block">You</span>
        )}
      </span>
    </div>
  );
}

export default function Lobby() {
  const { roomCode, players, isHost, startGame, leaveGame, playerId, addToast } = useGame();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [copied, setCopied] = useState(false);
  const connectedPlayers = players.filter((player) => player.connected !== false);

  const handleCopy = useCallback(async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      addToast('Code copied! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = roomCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      addToast('Code copied! 📋');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [roomCode, addToast]);

  const canStart = connectedPlayers.length >= 4 && selectedCategory && isHost;

  const handleStart = () => {
    if (!canStart) return;
    startGame(selectedCategory);
  };

  return (
    <div className="w-full h-full flex flex-col px-6 py-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <button
          onClick={leaveGame}
          className="text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1 transition-colors"
        >
          ← Leave
        </button>
        <div className="text-xs text-gray-400 font-medium">
          {connectedPlayers.length}/8 players
        </div>
      </div>

      {/* Room Code */}
      <div className="text-center mb-8 animate-slide-up">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2">
          Room Code
        </p>
        <button
          onClick={handleCopy}
          className="group relative inline-block"
        >
          <div className="text-5xl sm:text-6xl font-black tracking-[0.2em] text-gray-800 hover:text-accent transition-colors duration-200">
            {roomCode}
          </div>
          <div className={`mt-2 text-xs transition-all duration-200 ${copied ? 'text-neon-green' : 'text-gray-400 group-hover:text-gray-600'}`}>
            {copied ? '✓ Copied!' : 'Tap to copy'}
          </div>
        </button>
        <p className="text-gray-400 text-xs mt-2">Share this code with friends!</p>
      </div>

      {/* Players Grid */}
      <div className="glass-card p-5 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Players</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            connectedPlayers.length >= 4
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-yellow-50 text-yellow-600'
          }`}>
            {connectedPlayers.length < 4 ? `Need ${4 - connectedPlayers.length} more` : 'Ready!'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {players.map((player, i) => (
            <PlayerAvatar
              key={player.id}
              player={player}
              index={i}
              isCurrentPlayer={player.id === playerId}
            />
          ))}
          {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-lg">?</span>
              </div>
              <span className="text-[10px] text-gray-400">Waiting...</span>
            </div>
          ))}
        </div>
      </div>

      {/* Host Controls */}
      {isHost ? (
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Category Picker */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
              Choose Category
            </p>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`glass-card p-3 text-center transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'border-accent/50 bg-accent/5 scale-[1.02] shadow-sm'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <div className="text-xs font-semibold text-gray-800">{cat.label}</div>
                  <div className="text-[9px] text-gray-400">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 active:scale-[0.98] ${
              canStart
                ? 'bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/25 animate-glow'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {connectedPlayers.length < 4
              ? `Need ${4 - connectedPlayers.length} more players`
              : !selectedCategory
              ? 'Select a category'
              : 'Start Game 🚀'}
          </button>
        </div>
      ) : (
        <div className="text-center py-8 animate-fade-in">
          <div className="text-gray-400 text-sm mb-3">Waiting for host to start...</div>
          <div className="thinking-dots flex justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          </div>
        </div>
      )}
    </div>
  );
}
