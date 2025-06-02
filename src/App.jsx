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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [noClickCount, setNoClickCount] = useState(0);

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
    const randomDelay = Math.random() * 2;
    const randomDuration = Math.random() * 2 + 3;
    const randomSize = Math.random() * 30 + 50;

    return {
      id: Math.random(),
      emoji: randomEmoji,
      style: {
        position: 'fixed',
        left: `${randomLeft}%`,
        fontSize: `${randomSize}px`,
        opacity: 0,
        animation: `${isHappy ? 'floatUp' : 'appearAndGrow'} ${randomDuration}s ${randomDelay}s ease-out forwards`,
      },
    };
  }, []);

  const handleNoClick = useCallback(() => {
  if (noClickCount >= 4) {
    setStep('final');
    setIsSad(true);
    return;
  }

  setIsButtonEnabled(false);
  setIsSad(true);
  setSadEmojisArray([]);
  setEmojiCount(0);

  const interval = setInterval(() => {
    setSadEmojisArray((prev) => [
      ...prev.slice(-30),
      ...Array(3).fill().map(() => createEmoji(false)),
    ]);
    setEmojiCount((prev) => {
      const newCount = prev + 3;
      if (newCount >= maxEmojis) {
        clearInterval(interval);

        // увеличиваем количество отказов
        setNoClickCount((prevCount) => prevCount + 1);

        // возвращаем возможность нажать через 500мс
        setTimeout(() => {
          setIsButtonEnabled(true);

          // если это было 4-е или 5-е нажатие — финал
          if (noClickCount + 1 >= 4) {
            setStep('final');
          }
        }, 10);
      }
      return newCount;
    });
  }, 20);

  return () => clearInterval(interval);
}, [createEmoji, noClickCount]);


  const toggleAudio = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleYesClick = async () => {
    setIsTransitioning(true);
    setIsSad(false);
    setSadEmojisArray([]);
    setEmojiCount(0);

    setTimeout(async () => {
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

        setTimeout(() => {
          setLoveEmojisArray([]);
        }, 5000);
      }
      setIsTransitioning(false);
    }, 500);
  };

  const getFinalMessage = () => {
    if (isSad) return null;
    if (noClickCount === 0) return 'Abia aștept să ne cunoaștem mai bine! 💕';
    if (noClickCount === 1) return 'Mă bucur că te-ai răzgândit! 💝';
    if (noClickCount === 2) return 'Știam eu că vom fi împreună! 💖';
    return 'În sfârșit ai spus DA! 💗';
  };

  return (
    <div className={`app-container ${isSad ? 'sad-background' : 'default-background'}`}>
      {isSad && (
        <div className="rain">
          {Array.from({ length: 150 }).map((_, i) => (
            <div
              key={i}
              className="drop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 1 + 0.5}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {isSad && (
        <div className="emoji-container sad-emojis">
          {sadEmojisArray.map((emoji) => (
            <div key={emoji.id} style={emoji.style}>
              {emoji.emoji}
            </div>
          ))}
        </div>
      )}

      {!isSad && loveEmojisArray.length > 0 && (
        <div className="emoji-container love-emojis">
          {loveEmojisArray.map((emoji) => (
            <div key={emoji.id} style={emoji.style}>
              {emoji.emoji}
            </div>
          ))}
        </div>
      )}

      <button className="audio-button" onClick={toggleAudio}>
        {isPlaying ? '🔊' : '🔇'}
      </button>

      <div className="content-wrapper">
        <h1>❤️ Pentru Marinela ❤️</h1>

        <div className={`question-box ${isTransitioning ? 'fade-out' : ''}`}>
          {step === 'welcome' && (
            <>
              <p>Bună, Marinela! 🌸</p>
              <button onClick={() => setStep('boyfriend')}>
                Începe Aventura 💫
              </button>
            </>
          )}

          {step === 'boyfriend' && (
            <>
              <p>Ai prieten? 💭</p>
              <div className="button-group">
                <button onClick={handleYesClick}>
                  Da, dar tu ești mai special 😍
                </button>
                <button onClick={() => setStep('date')}>
                  Nu încă 😊
                </button>
              </div>
            </>
          )}

          {step === 'date' && (
            <>
              <p>Vrei să ieși cu mine? 💝</p>
              <div className="button-group">
                <button onClick={handleYesClick}>Da! 😊</button>
                <button
                  onClick={handleNoClick}
                  disabled={!isButtonEnabled}
                  style={{ opacity: isButtonEnabled ? 1 : 0.7 }}
                >
                  Nu 😢
                </button>
              </div>
            </>
          )}

          {step === 'final' && (
            <>
              <h2>{isSad ? 'Așa de repede m-ai părăsit? 😭' : 'Perfect! 💖'}</h2>
              <p>
                {isSad ? 'Dar în orice caz iată numărul meu:' : ''} Numărul meu este: 060833794 📱
              </p>
              {!isSad && (
                <p className="final-message">
                  {getFinalMessage()}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
