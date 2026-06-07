import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function RoleReveal() {
  const { role, topic, timer } = useGame();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [role, topic]);

  const handleReveal = () => {
    if (!revealed) setRevealed(true);
  };

  const isImposter = role === 'imposter';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px] transition-all duration-1000 pointer-events-none ${
          revealed
            ? isImposter
              ? 'bg-accent/20'
              : 'bg-neon-green/15'
            : 'bg-neon-purple/10'
        }`}
      />

      {/* Timer */}
      {timer > 0 && (
        <div className="absolute top-8 right-6 text-sm text-gray-500 font-mono">
          {timer}s
        </div>
      )}

      {/* Flip Card */}
      <div
        className="flip-card w-full max-w-[320px] h-[420px] cursor-pointer"
        onClick={handleReveal}
      >
        <div className={`flip-card-inner w-full h-full relative ${revealed ? 'flipped' : ''}`}>
          {/* Card Front — "Tap to reveal" */}
          <div className="flip-card-front absolute inset-0 glass-card-strong flex flex-col items-center justify-center p-8">
            <div className="text-6xl mb-6 animate-float">🃏</div>
            <h2 className="text-xl font-bold text-white mb-2">Your Role</h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Tap to reveal your role
            </p>
            <div className="animate-pulse-ring">
              <div className="w-16 h-16 rounded-full border-2 border-accent/50 flex items-center justify-center">
                <span className="text-accent text-sm font-medium">TAP</span>
              </div>
            </div>
          </div>

          {/* Card Back — Role Revealed */}
          <div
            className={`flip-card-back absolute inset-0 glass-card-strong flex flex-col items-center justify-center p-8 ${
              isImposter ? 'glow-red' : 'glow-green'
            }`}
          >
            {isImposter ? (
              <>
                <div className="text-6xl mb-4">💀</div>
                <h2
                  className="text-3xl font-black mb-2 text-center"
                  style={{
                    background: 'linear-gradient(135deg, #e94560, #ff6b81)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  YOU ARE THE IMPOSTER
                </h2>
                <div className="mt-4 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="text-gray-300 text-sm text-center leading-relaxed">
                    You don&apos;t know the topic.
                    <br />
                    <span className="text-accent font-semibold">Blend in!</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-lg font-semibold text-gray-300 mb-3">
                  The topic is...
                </h2>
                <div
                  className="text-4xl font-black mb-4 text-center px-4"
                  style={{
                    background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {topic}
                </div>
                <div className="mt-2 px-4 py-3 rounded-xl bg-neon-green/10 border border-neon-green/20">
                  <p className="text-gray-300 text-sm text-center leading-relaxed">
                    Don&apos;t let the imposter
                    <br />
                    <span className="text-neon-green font-semibold">figure out the word!</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hint text */}
      <p className="mt-6 text-xs text-gray-600 animate-fade-in">
        {revealed
          ? 'Memorize your role. Game starts soon...'
          : 'Tap the card to reveal'}
      </p>
    </div>
  );
}
