import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Delete } from 'lucide-react';

export const PinLockScreen: React.FC = () => {
  const { isPinLocked, currentUser, unlockWithPin, profiles, setCurrentUserId } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [isError, setIsError] = useState(false);

  if (!isPinLocked) return null;

  const handleKeyPress = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);

      if (next.length === 4) {
        // Attempt unlock
        const success = unlockWithPin(next);
        if (!success) {
          setIsError(true);
          setTimeout(() => {
            setPinInput('');
            setIsError(false);
          }, 600);
        } else {
          setPinInput('');
        }
      }
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  const other = profiles.find((p) => p.id !== currentUser.id) || profiles[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-between py-12 px-6 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col items-center pt-8 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 shadow-lg ring-4 ring-white/10"
          style={{ backgroundColor: currentUser.avatarColor + '30', color: currentUser.avatarColor }}
        >
          {currentUser.emoji}
        </div>
        <h2 className="text-xl font-bold">{currentUser.name}</h2>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" />
          <span>Zadajte 4-miestny PIN kód</span>
        </p>
      </div>

      {/* PIN Dots */}
      <div className={`flex items-center gap-4 my-8 ${isError ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((idx) => {
          const filled = pinInput.length > idx;
          return (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                filled ? 'bg-white scale-125' : 'bg-slate-700'
              } ${isError ? 'bg-rose-500' : ''}`}
            />
          );
        })}
      </div>

      {/* Numeric Keypad in iOS Style */}
      <div className="w-full max-w-xs space-y-3">
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
        ].map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-3 gap-3">
            {row.map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeyPress(digit)}
                className="h-16 rounded-full bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 text-2xl font-light text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
              >
                {digit}
              </button>
            ))}
          </div>
        ))}

        {/* Bottom row: Switch user, 0, backspace */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              setPinInput('');
              setCurrentUserId(other.id);
            }}
            className="h-16 rounded-full text-xs text-slate-400 hover:text-white flex items-center justify-center text-center leading-tight active:scale-95"
          >
            Prepnúť na {other.name}
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-full bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 text-2xl font-light text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-16 rounded-full text-slate-400 hover:text-white flex items-center justify-center active:scale-95 transition-colors"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
};
