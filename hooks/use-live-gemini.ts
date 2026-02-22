import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { useStore } from '@/lib/store';
import { generateUniversitySystemPrompt } from '@/lib/config';

export function useLiveGemini() {
  const { addMessage, schema, setSelectedChartType } = useStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseGateRef = useRef<DynamicsCompressorNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Utility: Encode PCM data to base64
  const encodePcm = useCallback((bytes: Uint8Array): string => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }, []);

  // Utility: Decode base64 to Uint8Array
  const decodeBase64 = useCallback((base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }, []);

  // Utility: Decode audio data for playback
  const decodeAudioData = useCallback(async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }, []);

  // Stop all audio playback (for interruption)
  const stopAudioPlayback = useCallback(() => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { /* ignore */ }
    });
    sourcesRef.current.clear();
    if (outputAudioContextRef.current) {
      nextPlayTimeRef.current = outputAudioContextRef.current.currentTime;
    }
    console.log('🛑 Audio playback stopped');
  }, []);

  // Initialize Audio Contexts
  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
        latencyHint: 'interactive',
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (!outputAudioContextRef.current) {
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
        latencyHint: 'interactive',
      });

      gainNodeRef.current = outputAudioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 0.9;
      gainNodeRef.current.connect(outputAudioContextRef.current.destination);

      const noiseGate = outputAudioContextRef.current.createDynamicsCompressor();
      noiseGate.threshold.value = -40;
      noiseGate.knee.value = 30;
      noiseGate.ratio.value = 15;
      noiseGate.attack.value = 0.002;
      noiseGate.release.value = 0.3;
      noiseGateRef.current = noiseGate;

      gainNodeRef.current.disconnect();
      gainNodeRef.current.connect(noiseGate);
      noiseGate.connect(outputAudioContextRef.current.destination);
    }
    if (outputAudioContextRef.current.state === 'suspended') {
      outputAudioContextRef.current.resume();
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    if (outputAudioContextRef.current?.state !== 'closed') {
      outputAudioContextRef.current?.close();
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch { }
    });
    sourcesRef.current.clear();
    nextPlayTimeRef.current = 0;
    console.log('🧹 Audio cleanup completed');
  }, []);

  // Schedule audio playback
  const scheduleNextChunk = useCallback(function processQueue() {
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || !outputAudioContextRef.current) return;

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;

    const buffer = outputAudioContextRef.current.createBuffer(1, chunk.length, 24000);
    buffer.getChannelData(0).set(chunk);

    const source = outputAudioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNodeRef.current!);

    const ctx = outputAudioContextRef.current;
    const startTime = Math.max(nextPlayTimeRef.current, ctx.currentTime);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;

    sourcesRef.current.add(source);
    source.onended = () => {
      sourcesRef.current.delete(source);
      isPlayingRef.current = false;
      processQueue();
    };
  }, []);

  // Play Audio Chunk
  const playAudioChunk = useCallback(async (base64Audio: string) => {
    if (!outputAudioContextRef.current) return;

    try {
      const ctx = outputAudioContextRef.current;
      const bytes = decodeBase64(base64Audio);
      const buffer = await decodeAudioData(bytes, ctx, 24000, 1);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNodeRef.current!);

      const startTime = Math.max(nextPlayTimeRef.current, ctx.currentTime);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + buffer.duration;

      sourcesRef.current.add(source);
      setIsSpeaking(true);

      source.onended = () => {
        sourcesRef.current.delete(source);
        if (sourcesRef.current.size === 0) {
          setIsSpeaking(false);
        }
      };
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }, [decodeBase64]);

  // INTERRUPT: Stop speaking immediately
  const interruptSpeaking = useCallback(() => {
    console.log('🛑 Interrupting speech...');

    audioQueueRef.current = [];
    isPlayingRef.current = false;

    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      if (gainNodeRef.current) {
        const currentTime = audioContextRef.current.currentTime;
        gainNodeRef.current.gain.cancelScheduledValues(currentTime);
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(0, currentTime + 0.01);
      }

      setTimeout(() => {
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = 1.0;
        }
      }, 100);
    }

    setIsSpeaking(false);
    console.log('✅ Speech interrupted - ready to listen');
  }, []);

  // Connect to Live API - Auto-connect using schema from env-configured database
  const connect = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      setError('Gemini API key not configured.');
      return;
    }

    if (schema.length === 0) {
      setError('University data not loaded. Please refresh the page.');
      return;
    }

    try {
      ensureAudioContext();
      setError(null);
      setConnectionStatus('connecting');

      const client = new GoogleGenAI({ apiKey });

      // Generate university-specific system prompt
      const systemPrompt = generateUniversitySystemPrompt(
        schema.map(table => {
          const columns = table.columns.map(col =>
            `- ${col.name} (${col.type})${col.isPrimaryKey ? ' [Primary Key]' : ''}${col.isForeignKey ? ' [Foreign Key]' : ''}`
          ).join('\n');
          return `Table: ${table.tableName}\nColumns:\n${columns}`;
        }).join('\n\n')
      );

      const sessionPromise = client.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          tools: [{
            functionDeclarations: [{
              name: 'run_sql_query',
              description: 'Executes a SQL query against the university database and returns results.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  query: {
                    type: Type.STRING,
                    description: 'The SQL query to execute.',
                  },
                  chartType: {
                    type: Type.STRING,
                    description: 'Type of visualization: bar, line, pie, table, or number',
                    enum: ['bar', 'line', 'pie', 'table', 'number'],
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Brief explanation of what this query shows',
                  },
                },
                required: ['query'],
              },
            }]
          }]
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live API connected');
            setIsConnected(true);
            setConnectionStatus('connected');
            setError(null);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle user interruption
            if (message.serverContent?.interrupted) {
              console.log('🎤 User interrupted - stopping audio playback');
              stopAudioPlayback();
              setIsSpeaking(false);
              setIsListening(true);
              return;
            }

            // Handle turn completion
            if (message.serverContent?.turnComplete) {
              setIsListening(true);
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              await playAudioChunk(base64Audio);
            }

            // Handle Tool Calls
            const toolCall = message.toolCall;
            if (toolCall) {
              console.log("Tool Call Received:", toolCall);
              const functionCalls = toolCall.functionCalls;

              if (functionCalls && functionCalls.length > 0) {
                for (const call of functionCalls) {
                  if (call.name === 'run_sql_query') {
                    const args = call.args as any;
                    const sqlQuery = args.query;
                    const chartType = args.chartType || 'table';
                    const explanation = args.explanation || '';

                    console.log('Executing SQL:', sqlQuery);
                    console.log('Chart Type:', chartType);

                    try {
                      const response = await fetch('/api/db/query', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: sqlQuery }),
                      });

                      const result = await response.json();

                      if (!response.ok) {
                        throw new Error(result.error || 'Query execution failed');
                      }

                      addMessage({
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: explanation || "I've got the data for you - check the screen!",
                        timestamp: Date.now(),
                        relatedQuery: {
                          ...result,
                          sql: sqlQuery,
                        },
                        chartType: chartType,
                      });

                      setSelectedChartType(chartType);

                      const session = await sessionRef.current;
                      session.sendToolResponse({
                        functionResponses: [{
                          name: call.name,
                          id: call.id,
                          response: {
                            success: true,
                            rows: result.rows.length,
                            columns: result.columns.length,
                            data: JSON.stringify(result)
                          }
                        }]
                      });

                    } catch (execError: any) {
                      console.error("Tool Execution Error", execError);

                      const session = await sessionRef.current;
                      session.sendToolResponse({
                        functionResponses: [{
                          name: call.name,
                          id: call.id,
                          response: { error: execError.message }
                        }]
                      });
                    }
                  }
                }
              }
            }
          },
          onclose: () => {
            console.log('Gemini Live API disconnected');
            setIsConnected(false);
            setIsListening(false);
            setIsSpeaking(false);
            setConnectionStatus('disconnected');
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError(err.message || 'Connection error');
            setIsConnected(false);
            setIsListening(false);
            setConnectionStatus('disconnected');
          }
        }
      });

      sessionRef.current = sessionPromise;
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect to Gemini');
      setConnectionStatus('disconnected');
    }
  }, [schema, addMessage, ensureAudioContext, playAudioChunk, setSelectedChartType]);

  // Start Recording
  const startRecording = useCallback(async () => {
    if (!sessionRef.current) {
      setError('Not connected. Please wait for connection.');
      return;
    }

    ensureAudioContext();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        }
      });
      mediaStreamRef.current = stream;

      const source = audioContextRef.current!.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContextRef.current!.createScriptProcessor(1024, 1, 1);
      processorRef.current = processor;

      let voiceActivityCount = 0;
      const VOICE_ACTIVITY_THRESHOLD = 0.015;
      const VOICE_ACTIVITY_FRAMES = 2;
      let isUserSpeaking = false;

      processor.onaudioprocess = async (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        const rms = Math.sqrt(inputData.reduce((sum, val) => sum + val * val, 0) / inputData.length);

        if (rms > VOICE_ACTIVITY_THRESHOLD) {
          voiceActivityCount++;

          if (voiceActivityCount >= VOICE_ACTIVITY_FRAMES && isSpeaking) {
            console.log('🎤 User speech detected! Interrupting AI... (RMS:', rms.toFixed(3), ')');
            interruptSpeaking();
            setIsSpeaking(false);
            voiceActivityCount = 0;
            isUserSpeaking = true;
          }
        } else {
          if (rms < VOICE_ACTIVITY_THRESHOLD * 0.5) {
            voiceActivityCount = 0;
            isUserSpeaking = false;
          }
        }

        const noiseThreshold = rms > 0.02 ? 0.008 : 0.02;
        const processedData = new Float32Array(inputData.length);

        for (let i = 0; i < inputData.length; i++) {
          processedData[i] = Math.abs(inputData[i]) < noiseThreshold ? 0 : inputData[i];
        }

        const targetSampleRate = 16000;
        const currentSampleRate = audioContextRef.current!.sampleRate;
        const ratio = currentSampleRate / targetSampleRate;
        const newLength = Math.floor(processedData.length / ratio);
        const pcm16 = new Int16Array(newLength);

        for (let i = 0; i < newLength; i++) {
          const s = Math.max(-1, Math.min(1, processedData[Math.floor(i * ratio)]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        const buffer = pcm16.buffer;
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = window.btoa(binary);

        const session = await sessionRef.current;
        session.sendRealtimeInput({
          media: {
            mimeType: "audio/pcm;rate=16000",
            data: base64Data
          }
        });
      };

      source.connect(processor);
      processor.connect(audioContextRef.current!.destination);
      setIsListening(true);
      setError(null);

      console.log('🎤 Recording started');

    } catch (err: any) {
      console.error("Error starting audio", err);
      setError('Microphone access denied. Please allow microphone access.');
      setIsListening(false);
    }
  }, [ensureAudioContext, isSpeaking, interruptSpeaking]);

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
  }, []);

  const disconnect = useCallback(() => {
    stopAudioPlayback();
    interruptSpeaking();
    if (sessionRef.current) {
      sessionRef.current.then((s: any) => s.close());
      sessionRef.current = null;
    }
    cleanup();
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setError(null);
    setConnectionStatus('disconnected');
  }, [stopAudioPlayback, interruptSpeaking, cleanup]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return {
    isConnected,
    isListening,
    isSpeaking,
    error,
    connectionStatus,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    interruptSpeaking,
  };
}
