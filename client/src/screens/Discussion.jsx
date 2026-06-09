import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';

function CountdownRing({ timeLeft, totalTime }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const dashOffset = circumference * (1 - progress);

  const getColor = () => {
    if (progress > 0.5) return '#10b981';
    if (progress > 0.25) return '#f59e0b';
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
          stroke="rgba(0,0,0,0.06)"
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
      <span className="absolute text-2xl font-bold text-gray-800 font-mono">{timeLeft}</span>
    </div>
  );
}

export default function Discussion() {
  const { timer, clues, players, chatMessages, sendChatMessage, playerId } = useGame();
  const totalTime = 30;
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setIsSending(true);
      sendChatMessage(messageInput);
      setMessageInput('');
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center px-6 py-8 gap-4 overflow-hidden">
      {/* Timer */}
      <div className="animate-fade-in">
        <CountdownRing timeLeft={timer} totalTime={totalTime} />
      </div>

      {/* Header */}
      <div className="text-center animate-slide-up">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Discussion 💬</h2>
        <p className="text-gray-500 text-sm">Who is the imposter?</p>
      </div>

      {/* Main Content - Two Columns */}
      <div className="w-full max-w-4xl flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left: Clues */}
        <div className="flex-1 flex flex-col min-h-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
            Submitted Clues
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {clues.map((clue) => {
              const player = players.find((p) => p.id === clue.playerId);
              return (
                <div key={clue.playerId} className="glass-card px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">
                    {player?.name || clue.playerName}
                  </span>
                  <span className="text-gray-800 font-bold text-sm">{clue.clue}</span>
                </div>
              );
            })}

            {clues.length === 0 && (
              <div className="glass-card p-6 text-center">
                <p className="text-gray-400 text-sm">No clues yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="flex-1 flex flex-col min-h-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
            Live Chat
          </h3>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-2 bg-white/30 rounded-lg p-3">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No messages yet. Start chatting! 💬
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className="text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-semibold ${msg.playerId === playerId ? 'text-neon-blue' : 'text-gray-700'}`}>
                      {msg.playerName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-800 ml-2">{msg.message}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 px-3 py-2 bg-white/50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              className="px-4 py-2 bg-neon-blue text-white rounded-lg font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="w-full text-center animate-fade-in">
        <div className="glass-card px-5 py-3 inline-block">
          <p className="text-gray-600 text-sm">
            Review the clues with your group.
            <br />
            <span className="text-gray-400 text-xs">Voting starts when the timer ends</span>
          </p>
        </div>
      </div>
    </div>
  );
}
