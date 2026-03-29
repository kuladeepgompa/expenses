import React, { useState, useEffect } from 'react';
import { Mic, MicOff, CheckCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const VoiceExpenseEntry = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  const { addExpense } = useFinance();

  let recognition = null;

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceCommand(text);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setFeedback('Error recognizing speech. Please try again.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setFeedback('');
      setShowFeedback(false);
      try {
        recognition?.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting recognition', e);
      }
    }
  };

  const processVoiceCommand = (text) => {
    // Simple parsing logic: "Spent 15 on lunch" or "Add 50 rupees for groceries"
    const lowerText = text.toLowerCase();
    
    // Extract numbers
    const amountMatch = lowerText.match(/\d+(\.\d{1,2})?/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

    if (!amount) {
      showFeedbackMsg('Could not understand the amount. Try saying "Spent ₹10 on coffee".');
      return;
    }

    // Try to guess category from common keywords
    let category = 'Other';
    if (/(food|lunch|dinner|breakfast|groceries|coffee|restaurant)/i.test(lowerText)) category = 'Food';
    else if (/(gas|uber|lyft|taxi|transit|travel)/i.test(lowerText)) category = 'Transport';
    else if (/(movie|game|show|entertainment)/i.test(lowerText)) category = 'Entertainment';
    else if (/(bill|rent|electricity|water|internet)/i.test(lowerText)) category = 'Bills';

    addExpense({
      amount: amount,
      category: category,
      date: new Date().toISOString(),
      note: text,
      type: 'expense'
    });

    showFeedbackMsg(`Added ₹${amount} for ${category} successfully!`);
  };

  const showFeedbackMsg = (msg) => {
    setFeedback(msg);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 4000);
  };

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null; // hide if not supported
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {showFeedback && (
        <div className="bg-surface border border-[rgba(255,255,255,0.05)] px-4 py-3 rounded-xl shadow-lg animate-fade-in flex items-center gap-2 max-w-sm" style={{ backdropFilter: 'blur(10px)' }}>
          {feedback.includes('Added') ? (
            <CheckCircle className="text-success" size={20} />
          ) : null}
          <p className="text-sm font-medium">{feedback}</p>
        </div>
      )}
      
      {isListening && !showFeedback && (
        <div className="bg-surface border border-[rgba(16,185,129,0.4)] px-4 py-3 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.15)] animate-fade-in flex flex-col gap-2 max-w-sm" style={{ backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" style={{ boxShadow: '0 0 10px rgba(16,185,129,0.8)' }}></span>
            </span>
            <p className="text-xs font-semibold text-success tracking-wide uppercase">Listening...</p>
          </div>
          <p className="text-sm italic text-secondary">"{transcript || 'Say something like "Spent ₹15 for lunch"'}"</p>
        </div>
      )}

      <button
        onClick={toggleListen}
        className={`flex items-center justify-center p-4 rounded-full shadow-lg transition-all ${
          isListening 
            ? 'bg-danger text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse' 
            : 'bg-primary text-[#022c22] hover:scale-110 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
        }`}
        title="Voice Expense Entry"
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
    </div>
  );
};

export default VoiceExpenseEntry;
