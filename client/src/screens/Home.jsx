import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const FLOATING_EMOJIS = [
  { emoji: '🕵️', top: '12%', left: '8%', delay: '0s', duration: '3s' },
  { emoji: '🎭', top: '18%', right: '10%', delay: '0.5s', duration: '3.5s' },
  { emoji: '🔍', bottom: '20%', left: '12%', delay: '1s', duration: '4s' },
  { emoji: '🤫', bottom: '15%', right: '8%', delay: '1.5s', duration: '3.2s' },
  { emoji: '❓', top: '45%', left: '5%', delay: '0.8s', duration: '3.8s' },
];

export default function Home() {
  const { createRoom, joinRoom, error, clearError, connected } = useGame();
  const [mode, setMode] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [createName, setCreateName] = useState('');

  const handleCreate = () => {
    if (!createName.trim() || createName.trim().length < 2) return;
    createRoom(createName.trim());
  };

  const handleJoin = () => {
    if (!code.trim() || code.trim().length !== 4) return;
    if (!name.trim() || name.trim().length < 2) return;
    joinRoom(code.trim(), name.trim());
  };

  const handleCodeChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    setCode(val);
    if (error) clearError();
  };

  const handleNameChange = (setter) => (e) => {
    const val = e.target.value.slice(0, 12);
    setter(val);
    if (error) clearError();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Floating emojis */}
      {FLOATING_EMOJIS.map((item, i) => (
        <div
          key={i}
          className="absolute text-3xl opacity-20 pointer-events-none select-none animate-float"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-neon-purple/5 blur-[100px] pointer-events-none" />

      {/* Title */}
      <div className="animate-fade-in text-center mb-10 relative z-10">
        <h1
          className="text-6xl sm:text-7xl font-black tracking-tight mb-3"
          style={{
            background: 'linear-gradient(135deg, #e94560, #ff6b81, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(233,69,96,0.4))',
          }}
        >
          IMPOSTER
        </h1>
        <p className="text-gray-400 text-lg font-medium tracking-wide">
          Who&apos;s faking it?
        </p>
      </div>

      {/* Connection warning */}
      {!connected && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-fade-in">
          Connecting to server...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-scale-in">
          {error}
        </div>
      )}

      {/* Cards */}
      <div className="w-full max-w-sm space-y-4 relative z-10 animate-slide-up">
        {mode === null && (
          <>
            <button
              onClick={() => setMode('create')}
              disabled={!connected}
              className="w-full glass-card-strong p-6 text-left group hover:border-accent/30 transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Create Game</h2>
                  <p className="text-gray-400 text-sm">Start a new room</p>
                </div>
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  🎮
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              disabled={!connected}
              className="w-full glass-card-strong p-6 text-left group hover:border-neon-blue/30 transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Join Game</h2>
                  <p className="text-gray-400 text-sm">Enter a room code</p>
                </div>
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  🚀
                </div>
              </div>
            </button>
          </>
        )}

        {mode === 'create' && (
          <div className="glass-card-strong p-6 animate-scale-in">
            <button
              onClick={() => { setMode(null); clearError(); }}
              className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Create a Game</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 block">
                  Your Name
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={handleNameChange(setCreateName)}
                  placeholder="Enter your name"
                  maxLength={12}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all text-base"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <p className="text-[10px] text-gray-500 mt-1">2-12 characters</p>
              </div>
              <button
                onClick={handleCreate}
                disabled={!createName.trim() || createName.trim().length < 2 || !connected}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Create Room
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="glass-card-strong p-6 animate-scale-in">
            <button
              onClick={() => { setMode(null); clearError(); }}
              className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Join a Game</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 block">
                  Room Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="ABCD"
                  maxLength={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-mono tracking-[0.3em] placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all uppercase"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 block">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange(setName)}
                  placeholder="Enter your name"
                  maxLength={12}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all text-base"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
                <p className="text-[10px] text-gray-500 mt-1">2-12 characters</p>
              </div>
              <button
                onClick={handleJoin}
                disabled={
                  code.length !== 4 ||
                  !name.trim() ||
                  name.trim().length < 2 ||
                  !connected
                }
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-lg hover:shadow-neon-blue/25 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
