import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
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

function useStaggeredReveal(roundResult) {
  const [revealStep, setRevealStep] = useState(0);
  const [revealedVoteIndex, setRevealedVoteIndex] = useState(-1);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!roundResult) return;

    setRevealStep(0);
    setRevealedVoteIndex(-1);

    const voteList = roundResult.votes || [];
    let step = 0;

    const nextStep = () => {
      if (step < voteList.length) {
        setRevealedVoteIndex(step);
        step++;
        timerRef.current = setTimeout(nextStep, 400);
      } else {
        timerRef.current = setTimeout(() => {
          setRevealStep(1);
          timerRef.current = setTimeout(() => {
            setRevealStep(2);
          }, 1200);
        }, 800);
      }
    };

    timerRef.current = setTimeout(nextStep, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [roundResult]);

  return { revealStep, revealedVoteIndex };
}

function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#e94560', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#e94560', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

function fireBigConfetti() {
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#e94560', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
  });
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { y: 0.4 },
      colors: ['#e94560', '#10b981', '#3b82f6', '#8b5cf6'],
    });
  }, 300);
}

export default function Results() {
  const {
    phase,
    roundResult,
    players,
    isHost,
    nextRound,
    playAgain,
    leaveGame,
    currentRound,
    totalRounds,
    finalScores,
    submitImposterGuess,
    imposterGuessResult,
    role,
    playerId,
  } = useGame();

  const isFinal = phase === 'finalResults';
  const { revealStep, revealedVoteIndex } = useStaggeredReveal(roundResult);
  const [imposterGuess, setImposterGuess] = useState('');
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const confettiFired = useRef(false);

  const caught = roundResult?.caught;
  const imposterName = roundResult?.imposterName || 'Unknown';
  const voteList = roundResult?.votes || [];
  const actualTopic = roundResult?.topic || roundResult?.word || '';
  const isImposter = role === 'imposter' || roundResult?.imposterId === playerId;

  // Fire confetti when caught is revealed
  useEffect(() => {
    if (revealStep >= 2 && caught && !confettiFired.current) {
      confettiFired.current = true;
      fireConfetti();
    }
  }, [revealStep, caught]);

  // Fire confetti on final results
  useEffect(() => {
    if (isFinal && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(fireBigConfetti, 500);
    }
  }, [isFinal]);

  // Reset confetti flag on new round result
  useEffect(() => {
    confettiFired.current = false;
  }, [roundResult]);

  const handleGuessSubmit = () => {
    if (!imposterGuess.trim() || guessSubmitted) return;
    submitImposterGuess(imposterGuess.trim());
    setGuessSubmitted(true);
  };

  const displayPlayers = isFinal
    ? [...(finalScores.length > 0 ? finalScores : players)].sort((a, b) => (b.score || 0) - (a.score || 0))
    : [...(roundResult?.players || players)].sort((a, b) => (b.score || 0) - (a.score || 0));

  // === FINAL RESULTS SCREEN ===
  if (isFinal) {
    const winner = displayPlayers[0];
    return (
      <div className="w-full h-full flex flex-col items-center px-6 py-8 overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1
            className="text-4xl font-black mb-2"
            style={{
              background: 'linear-gradient(135deg, #e94560, #8b5cf6, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            GAME OVER
          </h1>
          <p className="text-gray-500 text-sm">Final Standings</p>
        </div>

        {/* Winner */}
        {winner && (
          <div className="glass-card-strong p-6 text-center mb-6 w-full max-w-sm animate-scale-in glow-blue">
            <div className="text-5xl mb-3">👑</div>
            <h2 className="text-2xl font-black text-gray-800 mb-1">{winner.name}</h2>
            <p className="text-neon-blue text-sm font-semibold">Winner!</p>
            <p className="text-3xl font-black text-gray-800 mt-2">{winner.score || 0} pts</p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="w-full max-w-sm space-y-2 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {displayPlayers.map((player, i) => {
            const playerIndex = players.findIndex((p) => p.id === player.id);
            const colorClass = AVATAR_COLORS[(playerIndex >= 0 ? playerIndex : i) % AVATAR_COLORS.length];
            const initials = (player.name || '?')
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={player.id || i}
                className={`glass-card px-4 py-3 flex items-center gap-3 ${
                  i === 0 ? 'border-blue-200 bg-blue-50/50' : ''
                }`}
              >
                <span className={`text-sm font-bold w-6 text-center ${
                  i === 0 ? 'text-neon-blue' : i === 1 ? 'text-gray-500' : i === 2 ? 'text-yellow-600' : 'text-gray-400'
                }`}>
                  {i === 0 ? '👑' : `#${i + 1}`}
                </span>
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0`}>
                  {initials}
                </div>
                <span className="text-sm text-gray-800 font-medium flex-1 truncate">
                  {player.name}
                </span>
                <span className="text-sm font-bold text-gray-800">{player.score || 0}</span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3 mt-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {isHost && (
            <button
              onClick={playAgain}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/25 transition-all duration-300 active:scale-[0.98]"
            >
              Play Again 🔄
            </button>
          )}
          <button
            onClick={leaveGame}
            className="w-full py-3 rounded-xl font-medium text-sm bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-all duration-300"
          >
            Leave Game
          </button>
        </div>
      </div>
    );
  }

  // === ROUND RESULTS SCREEN ===
  return (
    <div className="w-full h-full flex flex-col items-center px-6 py-8 overflow-y-auto">
      {/* Round Indicator */}
      <div className="text-xs text-gray-400 font-medium mb-4 animate-fade-in">
        Round {currentRound}/{totalRounds}
      </div>

      {/* Vote Reveal */}
      <div className="w-full max-w-sm mb-6">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3 animate-fade-in">
          Votes
        </h3>
        <div className="space-y-2">
          {voteList.map((vote, i) => {
            const isRevealed = i <= revealedVoteIndex;
            return (
              <div
                key={i}
                className={`glass-card px-4 py-2.5 flex items-center justify-between transition-all duration-300 ${
                  isRevealed ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                <span className="text-sm text-gray-700">{vote.voterName}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">voted</span>
                  <span className="text-sm text-accent font-semibold">{vote.targetName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Imposter Reveal */}
      {revealStep >= 1 && (
        <div className="w-full max-w-sm text-center mb-4 animate-fade-in">
          <p className="text-gray-500 text-sm mb-2">The imposter was...</p>
        </div>
      )}

      {revealStep >= 2 && (
        <div
          className={`w-full max-w-sm text-center mb-6 animate-scale-in ${
            caught ? '' : ''
          }`}
        >
          <div
            className={`glass-card-strong p-6 ${caught ? 'glow-green' : 'glow-red'}`}
          >
            <div className="text-4xl mb-3">{caught ? '🎉' : '😈'}</div>
            <h2
              className="text-2xl font-black mb-2"
              style={{
                background: caught
                  ? 'linear-gradient(135deg, #10b981, #3b82f6)'
                  : 'linear-gradient(135deg, #e94560, #ff6b81)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {imposterName}
            </h2>
            <p className={`text-lg font-bold ${caught ? 'text-neon-green' : 'text-accent'}`}>
              {caught ? 'CAUGHT! 🎉' : 'ESCAPED! 😈'}
            </p>
            {actualTopic && (
              <p className="text-gray-500 text-xs mt-2">
                The word was: <span className="text-gray-800 font-semibold">{actualTopic}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Imposter Guess Section */}
      {revealStep >= 2 && caught && isImposter && !guessSubmitted && !imposterGuessResult && (
        <div className="w-full max-w-sm mb-6 animate-slide-up">
          <div className="glass-card p-4">
            <p className="text-sm text-gray-600 mb-3 text-center">
              Guess the word for <span className="text-neon-green font-bold">+1 point!</span>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={imposterGuess}
                onChange={(e) => setImposterGuess(e.target.value.slice(0, 30))}
                placeholder="Your guess..."
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-accent/50 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleGuessSubmit()}
                autoFocus
              />
              <button
                onClick={handleGuessSubmit}
                disabled={!imposterGuess.trim()}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-accent text-white disabled:opacity-30 transition-all active:scale-[0.97]"
              >
                Guess
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Imposter guess result */}
      {(guessSubmitted || imposterGuessResult) && (
        <div className="w-full max-w-sm mb-6 animate-scale-in">
          <div className={`glass-card p-4 text-center ${
            imposterGuessResult?.correct ? 'glow-green' : 'border-red-200'
          }`}>
            <p className={`text-sm font-semibold ${
              imposterGuessResult?.correct ? 'text-neon-green' : imposterGuessResult ? 'text-accent' : 'text-gray-400'
            }`}>
              {imposterGuessResult?.correct
                ? 'Correct guess! +1 point! 🎯'
                : imposterGuessResult
                ? 'Wrong guess! ❌'
                : 'Guess submitted...'}
            </p>
          </div>
        </div>
      )}

      {/* Scoreboard */}
      {revealStep >= 2 && (
        <div className="w-full max-w-sm mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
            Scoreboard
          </h3>
          <div className="space-y-2">
            {displayPlayers.map((player, i) => {
              const playerIndex = players.findIndex((p) => p.id === player.id);
              const colorClass = AVATAR_COLORS[(playerIndex >= 0 ? playerIndex : i) % AVATAR_COLORS.length];
              const initials = (player.name || '?')
                .split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              const scoreChange = player.scoreChange || player.roundScore || 0;

              return (
                <div
                  key={player.id || i}
                  className="glass-card px-4 py-3 flex items-center gap-3"
                >
                  <span className="text-xs text-gray-400 font-bold w-5 text-center">
                    {i + 1}
                  </span>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-[10px] shadow-md flex-shrink-0`}>
                    {initials}
                  </div>
                  <span className="text-sm text-gray-800 font-medium flex-1 truncate">
                    {player.name}
                  </span>
                  {scoreChange > 0 && (
                    <span className="text-xs text-neon-green font-bold mr-2">+{scoreChange}</span>
                  )}
                  <span className="text-sm font-bold text-gray-800">{player.score || 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Round / Final Results Button */}
      {revealStep >= 2 && isHost && (
        <div className="w-full max-w-sm mt-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {currentRound >= totalRounds ? (
            <button
              onClick={nextRound}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-lg shadow-neon-purple/20 hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
            >
              Final Results 🏆
            </button>
          ) : (
            <button
              onClick={nextRound}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/25 transition-all duration-300 active:scale-[0.98]"
            >
              Next Round →
            </button>
          )}
        </div>
      )}

      {revealStep >= 2 && !isHost && (
        <div className="w-full max-w-sm mt-auto text-center animate-fade-in">
          <p className="text-gray-400 text-sm">Waiting for host...</p>
        </div>
      )}
    </div>
  );
}
