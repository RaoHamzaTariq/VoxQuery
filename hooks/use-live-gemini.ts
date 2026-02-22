import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { useStore } from '@/lib/store';

export function useLiveGemini() {
  const { connection, addMessage, schema, setSelectedChartType } = useStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null); // Separate context for output
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseGateRef = useRef<DynamicsCompressorNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set()); // Track all playing sources

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

  // Utility: Create PCM blob from Float32Array (same as your working code)
  const createPcmBlob = useCallback((data: Float32Array): { data: string, mimeType: string } => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encodePcm(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }, [encodePcm]);

  // Utility: Decode audio data for playback (same as your working code)
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
    // Reset scheduler to avoid delays
    if (outputAudioContextRef.current) {
      nextPlayTimeRef.current = outputAudioContextRef.current.currentTime;
    }
    console.log('🛑 Audio playback stopped');
  }, []);

  // Initialize Audio Contexts (separate for input/output like your working code)
  const ensureAudioContext = useCallback(() => {
    // Input context (16kHz for microphone)
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
        latencyHint: 'interactive',
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    // Output context (24kHz for AI voice - better quality)
    if (!outputAudioContextRef.current) {
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
        latencyHint: 'interactive',
      });
      
      // Create gain node for volume control
      gainNodeRef.current = outputAudioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 0.9; // Prevent clipping
      gainNodeRef.current.connect(outputAudioContextRef.current.destination);
      
      // Create noise gate (compressor) for cleaner output
      const noiseGate = outputAudioContextRef.current.createDynamicsCompressor();
      noiseGate.threshold.value = -40;
      noiseGate.knee.value = 30;
      noiseGate.ratio.value = 15;
      noiseGate.attack.value = 0.002;
      noiseGate.release.value = 0.3;
      noiseGateRef.current = noiseGate;
      
      // Connect through compressor
      gainNodeRef.current.disconnect();
      gainNodeRef.current.connect(noiseGate);
      noiseGate.connect(outputAudioContextRef.current.destination);
    }
    if (outputAudioContextRef.current.state === 'suspended') {
      outputAudioContextRef.current.resume();
    }
  }, []);

  // Cleanup function (same pattern as your working code)
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

  // Schedule audio playback (simplified - using your working pattern)
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

  // Play Audio Chunk (using your working decode pattern)
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
  }, [decodeBase64, decodeAudioData]);

  // INTERRUPT: Stop speaking immediately and prepare to listen
  const interruptSpeaking = useCallback(() => {
    console.log('🛑 Interrupting speech...');
    
    // Clear audio queue immediately
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    
    // Suspend audio context to stop playback
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      // Quick fade out to avoid click (10ms)
      if (gainNodeRef.current) {
        const currentTime = audioContextRef.current.currentTime;
        gainNodeRef.current.gain.cancelScheduledValues(currentTime);
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(0, currentTime + 0.01);
      }
      
      // Reset gain after fade
      setTimeout(() => {
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = 1.0;
        }
      }, 100);
    }
    
    setIsSpeaking(false);
    console.log('✅ Speech interrupted - ready to listen');
  }, []);

  // Connect to Live API
  const connect = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      setError('Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.');
      return;
    }

    if (!connection) {
      setError('Please connect to a database first.');
      return;
    }

    if (schema.length === 0) {
      setError('Database schema not loaded. Please reconnect to your database.');
      return;
    }

    try {
      ensureAudioContext();
      setError(null);
      setConnectionStatus('connecting');

      const client = new GoogleGenAI({ apiKey });

      // Construct schema description for the system prompt
      const schemaDescription = schema.map(table => {
        const columns = table.columns.map(col =>
          `- ${col.name} (${col.type})${col.isPrimaryKey ? ' [Primary Key]' : ''}${col.isForeignKey ? ' [Foreign Key]' : ''}`
        ).join('\n');
        return `Table: ${table.tableName}\nColumns:\n${columns}`;
      }).join('\n\n');

      const systemPrompt = `You are Sarah , a friendly, female conversational database assistant. (Behave like female)

DATABASE SCHEMA:
${schemaDescription}

DATABASE TYPE: ${connection.type === 'mysql' ? 'MySQL' : 'PostgreSQL'}
DATABASE NAME: ${connection.database}

ALWAYS respond in the SAME language the user uses:
- User speaks English → Respond in English
- User speaks Urdu (اردو) → Respond in Urdu (اردو) 
- User speaks any language → Respond in that same language

YOUR PERSONALITY:
- Speak like a helpful colleague, not a robot
- Always start with greeting "Hi My name is Sara, your Data Assistant..."
- Be brief and conversational (2-3 sentences max for most responses)
- Use natural language with contractions (you're, we've, that's, I'm)
- Show enthusiasm for interesting findings
- Be honest about limitations
- Use phrases like "Hmm...", "Great question!", "Interesting...", "So..."

CRITICAL RESPONSE GUIDELINES:
1. NEVER read out all data/results - they're displayed on screen
2. ALWAYS reference the visual display: "Check the chart on screen", "You can see the results above", "I've displayed the data for you"
3. Share only KEY insights, not every number
4. For large datasets, say "I found X records. The top results show..." 
5. Keep spoken responses under 30 seconds (roughly 75 words)
6. After showing results, ask if they want more detail
7. User may ask the same query again and again and you have to run the sql query again before to answer.

QUERY RESPONSE FORMAT:
When using run_sql_query tool, include:
- query: The SQL to execute (required) 
- chartType: "bar" | "line" | "pie" | "table" | "number" (choose what makes sense)
- explanation: ONE sentence about what this shows

CHART SELECTION:
- Use "number" for single values (totals, counts)
- Use "bar" for comparisons across categories
- Use "line" for trends over time
- Use "pie" for proportions/percentages
- Use "table" for detailed data with many columns

EXAMPLE INTERACTIONS:

User: "Show me all our customers"
❌ Bad: "You have 150 customers. Customer 1 is Acme Corp located in North America, Customer 2 is Globex Inc in Europe..."
✅ Good: "You have 150 customers total. I've displayed them on screen - Acme Corp is your largest. Check out the table for the full list!"

User: "What's our total revenue?"
❌ Bad: "Your revenue is 1250000 dollars broken down by month as follows: January 65000, February 72000, March 68000, April 85000..."
✅ Good: "Your total revenue is $1.25M. The chart on screen shows monthly trends - you'll see we peaked in December. Pretty nice growth! Want to dive deeper into any specific month?"

User: "How many products do we have?"
❌ Bad: "You have 47 products. Product 1 is Widget A at 50 dollars, Product 2 is Widget B at 75 dollars..."
✅ Good: "47 products in your catalog. I'm showing them on screen - Widget Pro is your bestseller at $199. Check out the chart to see which ones are underperforming!"

User: "Show me sales by region"
✅ Good: "I've created a breakdown by region. North America is leading with 45% of sales - check out the pie chart! Europe and Asia are pretty close behind. Interesting, right?"

IMPORTANT RULES:
- NEVER execute DELETE, DROP, TRUNCATE, UPDATE, INSERT without explicit confirmation
- If asked for destructive operations, say: "I can't run that command for safety reasons. You'll need to use your database client directly."
- Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- If results are empty, say: "Hmm, no results found. Want to try a different query?"
- If there's an error, explain it simply: "There was an issue with that query. Let me try a different approach."

CONVERSATION FLOW:
1. Acknowledge the question
2. Execute query with run_sql_query tool
3. Share 1-2 key insights verbally
4. Reference the screen display
5. Ask if they want more detail

Remember: Results are ALWAYS shown on screen - your job is to highlight the interesting parts, not read everything!`;

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
              description: 'Executes a SQL query against the connected database and returns results.',
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
            // === HANDLE USER INTERRUPTION (Using your working Zayka Palace pattern) ===
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
                      // Execute via our Next.js API
                      const response = await fetch('/api/db/query', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ connection, query: sqlQuery }),
                      });

                      const result = await response.json();

                      if (!response.ok) {
                        throw new Error(result.error || 'Query execution failed');
                      }

                      // Add single assistant message with results (no duplicate)
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

                      // Send Response back to Gemini
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
  }, [connection, schema, addMessage, ensureAudioContext, playAudioChunk, setSelectedChartType]);

  // Start Recording / Streaming with enhanced voice activity detection
  const startRecording = useCallback(async () => {
    if (!sessionRef.current) {
      setError('Not connected to Gemini. Please connect first.');
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

      const processor = audioContextRef.current!.createScriptProcessor(1024, 1, 1); // Even smaller buffer = faster response
      processorRef.current = processor;

      // Voice activity detection state
      let voiceActivityCount = 0;
      const VOICE_ACTIVITY_THRESHOLD = 0.015;  // More sensitive threshold (was 0.03)
      const VOICE_ACTIVITY_FRAMES = 2;  // Number of consecutive frames to detect voice
      let isUserSpeaking = false;

      processor.onaudioprocess = async (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate RMS (Root Mean Square) for voice activity detection
        const rms = Math.sqrt(inputData.reduce((sum, val) => sum + val * val, 0) / inputData.length);
        
        // Enhanced Voice Activity Detection for auto-interrupt
        // More sensitive and responsive to user speech
        if (rms > VOICE_ACTIVITY_THRESHOLD) {
          voiceActivityCount++;
          
          // If we detect voice for consecutive frames AND AI is speaking
          if (voiceActivityCount >= VOICE_ACTIVITY_FRAMES && isSpeaking) {
            console.log('🎤 User speech detected! Interrupting AI... (RMS:', rms.toFixed(3), ')');

            // Immediately stop AI speech
            interruptSpeaking();
            setIsSpeaking(false);

            voiceActivityCount = 0;
            isUserSpeaking = true;
          }
        } else {
          // Reset counter when voice stops
          if (rms < VOICE_ACTIVITY_THRESHOLD * 0.5) {
            voiceActivityCount = 0;
            isUserSpeaking = false;
          }
        }

        // Apply enhanced adaptive noise gate to input
        const noiseThreshold = rms > 0.02 ? 0.008 : 0.02;  // Adaptive based on ambient noise
        const processedData = new Float32Array(inputData.length);

        // Apply noise gate ONLY - minimal processing for speed
        for (let i = 0; i < inputData.length; i++) {
          processedData[i] = Math.abs(inputData[i]) < noiseThreshold ? 0 : inputData[i];
        }

        // Downsample to 16kHz
        const targetSampleRate = 16000;
        const currentSampleRate = audioContextRef.current!.sampleRate;
        const ratio = currentSampleRate / targetSampleRate;
        const newLength = Math.floor(processedData.length / ratio);
        const pcm16 = new Int16Array(newLength);

        for (let i = 0; i < newLength; i++) {
          const s = Math.max(-1, Math.min(1, processedData[Math.floor(i * ratio)]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Convert to Base64
        const buffer = pcm16.buffer;
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = window.btoa(binary);

        // Send to Gemini
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

      console.log('🎤 Recording started with enhanced voice detection');

    } catch (err: any) {
      console.error("Error starting audio", err);
      setError('Microphone access denied. Please allow microphone access and try again.');
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

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Clear error after 5 seconds
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
