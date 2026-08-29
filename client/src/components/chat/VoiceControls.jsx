import React, { useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export default function VoiceControls({ onSpeechResult, textToSpeak }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported by your current browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (onSpeechResult) onSpeechResult(transcript);
    };

    recognition.start();
  };

  const handleTextToSpeech = () => {
    if (!('speechSynthesis' in window) || !textToSpeak) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = textToSpeak.replace(/[*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2 rounded-lg transition ${
          isListening ? 'bg-red-600/80 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'
        }`}
        title="Voice Input"
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>

      {textToSpeak && (
        <button
          type="button"
          onClick={handleTextToSpeech}
          className={`p-2 rounded-lg transition ${
            isSpeaking ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Read Answer Aloud"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}