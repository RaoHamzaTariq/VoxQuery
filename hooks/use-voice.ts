import { useState, useEffect, useRef, useCallback } from 'react';

export interface VoiceState {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  audioData: Uint8Array;
}

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const startVisualizer = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const update = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData(new Uint8Array(dataArray)); // Copy to trigger state update
          rafRef.current = requestAnimationFrame(update);
        }
      };
      
      update();
    } catch (err) {
      console.error("Error accessing microphone for visualizer:", err);
    }
  };

  const stopVisualizer = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    // Don't close context, just disconnect source
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after one sentence for command-like interaction
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          startVisualizer();
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(finalTranscript || interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          stopVisualizer();
        };

        recognition.onend = () => {
          setIsListening(false);
          stopVisualizer();
        };

        recognitionRef.current = recognition;
      }

      // Initialize Speech Synthesis
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      stopVisualizer();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Recognition already started", e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Select a good voice if available
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
      if (preferredVoice) utterance.voice = preferredVoice;

      synthRef.current.speak(utterance);
    }
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    audioData,
    startListening,
    stopListening,
    speak,
    setTranscript
  };
}
