import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const sadEmojis = ['😭'];
const happyEmojis = ['💖'];

function App() {
  const [step, setStep] = useState('welcome');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio('/melodie_romantica.mp3'));
  const [sadEmojisArray, setSadEmojisArray] = useState([]);
  const [loveEmojisArray, setLoveEmojisArray] = useState([]);
  const [emojiCount, setEmojiCount] = useState(0);
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const [isSad, setIsSad] = useState(false);
  const maxEmojis = 50;

  useEffect(() => {
    audio.loop = true;
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  useEffect(() => {
    if (emojiCount >= maxEmojis) {
      setIsButtonEnabled(true);
    }
  }, [emojiCount]);

  const createEmoji = useCallback((isHappy = false) => {
    const emojiList = isHappy ? happyEmojis : sadEmojis;
    const randomEmoji = emojiList[0];
    const randomLeft = Math.random() * 80 + 10;
    const randomBottom = Math.random() * 70;
    const randomSize = Math.random() * 30 + 50;
    const randomDelay = Math.random() * 0.5;

    return {
      id: Math.random(),
      emoji: randomEmoji,
      style: {
        position: 'fixed',
        left: `${randomLeft}%`,
        bottom: `${randomBottom}%`,
        fontSize: `${randomSize}px`,
        opacity: 0,
        transform: 'scale(0.5)',
        animation: `${isHappy ? 'floatUp' : 'appearAndGrow'} 2s ${randomDelay}s ease-out forwards`,
      },
    };
  }, []);

  const handleNoClick = useCallback(() => {
    if (emojiCount < maxEmojis) {
      setIsButtonEnabled(false);
      setIsSad(true);
      const interval = setInterval(() => {
        if (emojiCount < maxEmojis) {
          const newEmojis = Array(3).fill().map(() => createEmoji(false));
          setSadEmojisArray(prev => [...prev.slice(-30), ...newEmojis]); // Keep only last 30 emojis
          setEmojiCount(prev => prev + 3);
        } else {
          clearInterval(interval);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [emojiCount, createEmoji]);

  const toggleAudio = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleYesClick = async () => {
    setIsSad(false);
    setSadEmojisArray([]); // Clear sad emojis
    if (step === 'boyfriend') {
      setStep('date');
    } else if (step === 'date') {
      await supabase.from('answers').insert([
        {
          user_name: 'Marinela',
          question: 'final_answer',
          answer: 'yes',
        },
      ]);
      const newLoveEmojis = Array(20).fill().map(() => createEmoji(true));
      setLoveEmojisArray(newLoveEmojis);
      setStep('final');
    }
  };

  return (
    <div className="app-container">
      <div className="emoji-container sad-emojis">
        {sadEmojisArray.map((emoji) => (
          <div 
            key={emoji.id} 
            style={emoji.style}
          >
            {emoji.emoji}
          </div>
        ))}
      </div>

      <div className="emoji-container love-emojis">
        {loveEmojisArray.map((emoji) => (
          <div 
            key={emoji.id} 
            style={emoji.style}
          >
            {emoji.emoji}
          </div>
        ))}
      </div>

      <button 
        className="audio-button"
        onClick={toggleAudio}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>

      <div className="content-wrapper">
        <h1>❤️ Pentru Marinela ❤️</h1>

        {step === 'welcome' && (
          <div className="question-box">
            <p>Bună, Marinela! 🌸</p>
            <button onClick={() => setStep('boyfriend')}>
              Începe Aventura 💫
            </button>
          </div>
        )}

        {step === 'boyfriend' && (
          <div className="question-box">
            <p>Ai prieten? 💭</p>
            <div className="button-group">
              <button onClick={handleYesClick}>
                Da, dar tu ești mai special 😍
              </button>
              <button onClick={() => setStep('date')}>
                Nu încă 😊
              </button>
            </div>
          </div>
        )}

        {step === 'date' && (
          <div className="question-box">
            <p>Vrei să ieși cu mine? 💝</p>
            <div className="button-group">
              <button onClick={handleYesClick}>
                Da! 😊
              </button>
              <button 
                onClick={handleNoClick}
                disabled={!isButtonEnabled}
                style={{ opacity: isButtonEnabled ? 1 : 0.7 }}
              >
                Nu 😢
              </button>
            </div>
          </div>
        )}

        {step === 'final' && (
          <div className="question-box">
            <h2>{isSad ? 'Așa de repede m-ai părăsit? 😭' : 'Perfect! 💖'}</h2>
            <p>{isSad ? 'Dar în orice caz iată numărul meu:' : ''} Numărul meu este: 060833794 📱</p>
            {!isSad && (
              <p className="final-message">
                Abia aștept să ne cunoaștem mai bine! 💕
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;