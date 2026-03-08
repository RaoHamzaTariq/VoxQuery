# 🎤 VoxQuery Voice Features

> Comprehensive documentation for VoxQuery's voice interface and audio processing capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Voice Interface](#voice-interface)
- [Audio Processing Pipeline](#audio-processing-pipeline)
- [Interrupt System](#interrupt-system)
- [Voice Activity Detection](#voice-activity-detection)
- [Audio Quality Enhancements](#audio-quality-enhancements)
- [Voice Controls](#voice-controls)
- [Troubleshooting](#troubleshooting)

---

## Overview

VoxQuery features a state-of-the-art voice interface powered by **Google Gemini 2.5 Live API**, enabling natural, real-time conversations with your database. The voice system is designed for low latency, high accuracy, and intuitive user interaction.

### Key Features

| Feature | Description | Latency |
|---------|-------------|---------|
| **Real-Time Streaming** | Bidirectional audio streaming | < 100ms |
| **Voice Activity Detection** | Auto-detect when user speaks | ~20ms |
| **Interrupt System** | Stop AI mid-speech | < 50ms |
| **Noise Reduction** | Remove background noise | Real-time |
| **Multi-Modal Output** | Voice + Visualizations | Synchronized |

### Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| **Chrome 120+** | ✅ Full | Recommended |
| **Edge 120+** | ✅ Full | Recommended |
| **Firefox 120+** | ⚠️ Limited | May need flags enabled |
| **Safari 17+** | ⚠️ Limited | Use text chat fallback |

---

## Voice Interface

### Connection Flow

```
1. User clicks "Connect" button
         │
         ▼
2. Establish Gemini Live API session
         │
         ▼
3. Request microphone permission
         │
         ▼
4. Initialize audio contexts (input/output)
         │
         ▼
5. Display "Ready to listen" status
         │
         ▼
6. User clicks microphone to start
```

### Voice States

VoxQuery tracks three voice states:

```typescript
interface VoiceState {
  isConnected: boolean;    // Gemini session active
  isListening: boolean;    // Microphone active, listening
  isSpeaking: boolean;     // AI is speaking
}
```

**State Transitions:**

```
┌─────────────┐
│ Disconnected│
└──────┬──────┘
       │ Click "Connect"
       ▼
┌─────────────┐
│  Connected  │◄────────────────┐
└──────┬──────┘                 │
       │ Click Microphone       │ AI finishes speaking
       ▼                        │
┌─────────────┐                 │
│  Listening  │─────────────────┘
└──────┬──────┘
       │ User speaks
       ▼
┌─────────────┐
│  Speaking   │
│   (AI)      │
└─────────────┘
```

### Voice Indicators

Visual feedback for voice states:

| State | Visual Indicator | Color |
|-------|-----------------|-------|
| **Connected** | Power icon | Green |
| **Listening** | Microphone pulsing | Blue |
| **Speaking** | Waveform animation | Purple |
| **Processing** | Spinner | Yellow |
| **Error** | Warning icon | Red |

---

## Audio Processing Pipeline

### Input Pipeline (Microphone → Gemini)

```
┌─────────────────────────────────────────────────────────────────┐
│                    INPUT AUDIO PIPELINE                         │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │Microphone│ → │Noise Gate│ → │   RMS    │ → │Downsample│    │
│  │          │   │          │   │Detection │   │  16kHz   │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
│       │              │              │              │            │
│  getUserMedia    -50dB gate    0.015 RMS     PCM encoding      │
│       │              │              │              │            │
│       ▼              ▼              ▼              ▼            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Web Audio API Processing                    │  │
│  │  • AudioContext @ 16kHz                                  │  │
│  │  • ScriptProcessor (1024 sample buffer)                  │  │
│  │  • Echo cancellation                                     │  │
│  │  • Noise suppression                                     │  │
│  │  • Auto gain control                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │  Gemini Live API │                        │
│                    │  (Base64 PCM)    │                        │
│                    └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### Output Pipeline (Gemini → Speakers)

```
┌─────────────────────────────────────────────────────────────────┐
│                   OUTPUT AUDIO PIPELINE                         │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │  Gemini  │ → │  Decode  │ → │   Gain   │ → │Compressor│    │
│  │  Base64  │   │  Base64  │   │  0.9x    │   │  -40dB   │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
│       │              │              │              │            │
│   24kHz PCM    Float32Array   Volume control  Noise gate      │
│       │              │              │              │            │
│       ▼              ▼              ▼              ▼            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Web Audio API Playback                      │  │
│  │  • AudioContext @ 24kHz                                  │  │
│  │  • AudioBufferSource for each chunk                      │  │
│  │  • Scheduled playback for smooth output                  │  │
│  │  • Queue management for continuous speech                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │     Speakers     │                        │
│                    └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### Audio Specifications

| Parameter | Input | Output |
|-----------|-------|--------|
| **Sample Rate** | 16 kHz | 24 kHz |
| **Bit Depth** | 16-bit PCM | 16-bit PCM |
| **Channels** | Mono | Mono |
| **Buffer Size** | 1024 samples | Variable |
| **Latency Hint** | `interactive` | `interactive` |
| **Encoding** | Base64 PCM | Base64 PCM |

---

## Interrupt System

VoxQuery features a **three-way interrupt system** for natural conversations.

### Interrupt Methods

| Method | Trigger | Response Time | Use Case |
|--------|---------|---------------|----------|
| **Button** | Click Stop button | < 50ms | Manual control |
| **Keyboard** | Press Space bar | < 50ms | Quick interrupt |
| **Voice** | Start speaking | ~100ms | Natural conversation |

### Interrupt Flow

```
User triggers interrupt
         │
         ▼
┌─────────────────────────────────┐
│  1. Clear Audio Queue           │
│     - Discard pending chunks    │
│     - Stop scheduling           │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  2. Stop Audio Sources          │
│     - Stop all BufferSources    │
│     - Clear sources set         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  3. Fade Out Gain               │
│     - 10ms linear fade          │
│     - Prevent audio clicks      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  4. Reset State                 │
│     - isSpeaking = false        │
│     - isListening = true        │
│     - Reset nextPlayTime        │
└──────────────┬──────────────────┘
               │
               ▼
         Ready to listen
```

### Implementation

```typescript
// Interrupt speaking immediately
const interruptSpeaking = useCallback(() => {
  console.log('🛑 Interrupting speech...');

  // Clear audio queue
  audioQueueRef.current = [];
  isPlayingRef.current = false;

  // Quick fade out (10ms)
  if (gainNodeRef.current) {
    const currentTime = audioContextRef.current.currentTime;
    gainNodeRef.current.gain.cancelScheduledValues(currentTime);
    gainNodeRef.current.gain.setValueAtTime(
      gainNodeRef.current.gain.value,
      currentTime
    );
    gainNodeRef.current.gain.linearRampToValueAtTime(0, currentTime + 0.01);
  }

  // Reset gain after fade
  setTimeout(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = 1.0;
    }
  }, 100);

  setIsSpeaking(false);
  console.log('✅ Speech interrupted - ready to listen');
}, []);
```

### Keyboard Interrupt

```typescript
// Space bar interrupt handler
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && isSpeaking) {
      e.preventDefault();
      interruptSpeaking();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isSpeaking, interruptSpeaking]);
```

---

## Voice Activity Detection

### RMS-Based Detection

VoxQuery uses **Root Mean Square (RMS)** analysis for voice activity detection.

```typescript
// Calculate RMS of audio frame
const rms = Math.sqrt(
  inputData.reduce((sum, val) => sum + val * val, 0) / inputData.length
);

// Detection threshold
const VOICE_ACTIVITY_THRESHOLD = 0.015;  // RMS level
const VOICE_ACTIVITY_FRAMES = 2;          // Consecutive frames

// Detect voice activity
if (rms > VOICE_ACTIVITY_THRESHOLD) {
  voiceActivityCount++;
  
  // Auto-interrupt if AI is speaking
  if (voiceActivityCount >= VOICE_ACTIVITY_FRAMES && isSpeaking) {
    interruptSpeaking();
  }
} else {
  // Reset counter when voice stops
  if (rms < VOICE_ACTIVITY_THRESHOLD * 0.5) {
    voiceActivityCount = 0;
  }
}
```

### Detection Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Threshold** | 0.015 RMS | Level above which is considered voice |
| **Frames** | 2 | Consecutive frames to confirm voice |
| **Hysteresis** | 0.5x | Lower threshold for resetting |
| **Buffer Size** | 1024 samples | ~21ms at 48kHz |

### Tuning VAD Sensitivity

**For quiet environments:**
```typescript
const VOICE_ACTIVITY_THRESHOLD = 0.01;  // More sensitive
```

**For noisy environments:**
```typescript
const VOICE_ACTIVITY_THRESHOLD = 0.03;  // Less sensitive
const VOICE_ACTIVITY_FRAMES = 3;        // More confirmation
```

---

## Audio Quality Enhancements

### Noise Gate (Input)

Removes background noise below threshold:

```typescript
// Apply noise gate
const noiseThreshold = rms > 0.02 ? 0.008 : 0.02;  // Adaptive
const processedData = new Float32Array(inputData.length);

for (let i = 0; i < inputData.length; i++) {
  processedData[i] = Math.abs(inputData[i]) < noiseThreshold 
    ? 0 
    : inputData[i];
}
```

### Noise Gate (Output)

Compressor-based noise gate for cleaner output:

```typescript
// Create dynamics compressor
const noiseGate = outputAudioContextRef.current.createDynamicsCompressor();
noiseGate.threshold.value = -40;    // dB
noiseGate.knee.value = 30;          // dB
noiseGate.ratio.value = 15;         // Ratio
noiseGate.attack.value = 0.002;     // Seconds
noiseGate.release.value = 0.3;      // Seconds
```

### Gain Control

Prevent clipping with gain control:

```typescript
// Create gain node
gainNodeRef.current = outputAudioContextRef.current.createGain();
gainNodeRef.current.gain.value = 0.9;  // Prevent clipping
```

### Echo Cancellation

Browser-provided echo cancellation:

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000,
  }
});
```

### Audio Quality Parameters

| Enhancement | Parameter | Value |
|-------------|-----------|-------|
| **Noise Gate Threshold** | Input | -50dB (adaptive) |
| **Compressor Threshold** | Output | -40dB |
| **Compression Ratio** | Output | 15:1 |
| **Attack Time** | Output | 2ms |
| **Release Time** | Output | 300ms |
| **Gain Limit** | Output | 0.9 (90%) |

---

## Voice Controls

### Control Reference

| Control | Action | State | Icon |
|---------|--------|-------|------|
| **Connect** | Establish Gemini session | Disconnected | Power |
| **Disconnect** | End Gemini session | Connected | Power (filled) |
| **Microphone** | Start listening | Connected | Mic |
| **Stop Listening** | Stop microphone | Listening | Mic (filled) |
| **Stop AI** | Interrupt AI | Speaking | Stop (red) |
| **Clear Chat** | Reset conversation | Any | Trash |

### Keyboard Shortcuts

| Shortcut | Action | Condition |
|----------|--------|-----------|
| `Space` | Interrupt AI | When AI is speaking |
| `M` | Toggle microphone | When connected |
| `Escape` | Stop listening | When listening |
| `C` | Clear chat | Any |

### Voice Commands

While VoxQuery understands natural language, these phrases work well:

**Query Examples:**
- "Show me total sales"
- "How many customers do we have?"
- "What was our revenue last month?"
- "Compare this year to last year"
- "Which products are low in stock?"

**Control Commands:**
- "Stop" - Interrupts AI
- "Never mind" - Cancels current query
- "Clear chat" - Clears conversation

---

## Troubleshooting

### Microphone Issues

#### Problem: Microphone not detected

**Symptoms:**
- Microphone button doesn't activate
- Browser shows blocked icon
- No audio visualization

**Solutions:**

1. **Grant Permission**
   ```
   1. Click lock icon in address bar
   2. Select "Allow" for microphone
   3. Refresh page
   ```

2. **Check Browser**
   - Use Chrome 120+ or Edge 120+
   - Update browser to latest version

3. **Test Microphone**
   ```bash
   # Use another app to verify mic works
   # e.g., Google Meet, Zoom, online mic test
   ```

4. **Check System Settings**
   - Windows: Settings → Privacy → Microphone
   - macOS: System Preferences → Security → Microphone

#### Problem: Microphone permission denied

**Error:**
```
NotAllowedError: Permission denied
```

**Solution:**
```
1. Click site settings (lock icon)
2. Reset microphone permission
3. Refresh page
4. Grant permission when prompted
```

### Audio Issues

#### Problem: No audio from AI

**Symptoms:**
- AI responds but no sound
- Visualizations appear normally

**Solutions:**

1. **Check Volume**
   - Ensure system volume is up
   - Check browser tab isn't muted

2. **Check Output Device**
   ```
   1. Click speaker icon in system tray
   2. Select correct output device
   3. Test with other audio
   ```

3. **Restart Audio Context**
   ```
   1. Disconnect from Gemini
   2. Refresh page
   3. Reconnect
   ```

#### Problem: Audio has noise or crackling

**Symptoms:**
- Static or buzzing in output
- Choppy audio

**Solutions:**

1. **Use Recommended Browser**
   - Chrome 120+ or Edge 120+

2. **Check Internet Connection**
   - Unstable connection causes buffering
   - Try wired connection

3. **Close Other Tabs**
   - Free up system resources
   - Audio processing is CPU-intensive

4. **Clear Browser Cache**
   ```
   1. Settings → Privacy → Clear browsing data
   2. Select "Cached images and files"
   3. Clear data
   ```

### Voice Detection Issues

#### Problem: AI doesn't stop when I speak

**Symptoms:**
- Auto-interrupt not triggering
- AI continues speaking over you

**Solutions:**

1. **Speak Louder**
   - Detection threshold is 0.015 RMS
   - Speak clearly into microphone

2. **Check Mic Sensitivity**
   - Increase in system sound settings
   - Move microphone closer

3. **Use Manual Interrupt**
   - Press Space bar
   - Click Stop button

4. **Reduce Background Noise**
   - Close windows
   - Turn off fans/AC

#### Problem: False interrupts from background noise

**Symptoms:**
- AI interrupts without user speaking
- Background noise triggers interrupt

**Solutions:**

1. **Increase Threshold** (Developer)
   ```typescript
   const VOICE_ACTIVITY_THRESHOLD = 0.03;  // Less sensitive
   ```

2. **Increase Frame Count** (Developer)
   ```typescript
   const VOICE_ACTIVITY_FRAMES = 3;  // More confirmation
   ```

3. **Use Quieter Environment**
   - Close windows
   - Use noise-canceling microphone

### Connection Issues

#### Problem: Gemini connection fails

**Error:**
```
Error: Failed to connect to Gemini
```

**Solutions:**

1. **Verify API Key**
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY="your_actual_key"
   ```

2. **Check API Key Validity**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Test API key
   - Check quota limits

3. **Restart Development Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Check Network**
   - Ensure internet connection
   - Check firewall settings
   - Verify Gemini API is accessible

#### Problem: Connection drops frequently

**Symptoms:**
- Random disconnections
- "Connection lost" errors

**Solutions:**

1. **Check Network Stability**
   - Use wired connection if possible
   - Test internet speed

2. **Reduce Background Traffic**
   - Close other tabs
   - Pause downloads

3. **Check API Quota**
   - Visit Google AI Studio
   - Verify quota limits
   - Upgrade if needed

---

## Performance Optimization

### Latency Reduction

| Optimization | Impact | Implementation |
|--------------|--------|----------------|
| **Smaller Buffer** | ~21ms | 1024 sample buffer |
| **Interactive Mode** | Low latency | `latencyHint: 'interactive'` |
| **Separate Contexts** | Clean I/O | Input @ 16kHz, Output @ 24kHz |
| **Direct Streaming** | Real-time | No intermediate buffering |

### Memory Management

```typescript
// Cleanup on disconnect
const cleanup = useCallback(() => {
  // Stop all media streams
  if (mediaStreamRef.current) {
    mediaStreamRef.current.getTracks().forEach(t => t.stop());
  }
  
  // Disconnect audio nodes
  if (processorRef.current) processorRef.current.disconnect();
  if (sourceRef.current) sourceRef.current.disconnect();
  
  // Close audio contexts
  if (audioContextRef.current?.state !== 'closed') {
    audioContextRef.current?.close();
  }
  if (outputAudioContextRef.current?.state !== 'closed') {
    outputAudioContextRef.current?.close();
  }
  
  // Clear sources
  sourcesRef.current.forEach(s => {
    try { s.stop(); } catch { }
  });
  sourcesRef.current.clear();
}, []);
```

---

## Best Practices

### For Users

1. **Use Recommended Browser**
   - Chrome 120+ or Edge 120+
   - Keep browser updated

2. **Use Good Microphone**
   - External mic preferred
   - Noise-canceling recommended

3. **Speak Clearly**
   - Normal speaking volume
   - Avoid background noise

4. **Use Interrupt Features**
   - Press Space to interrupt
   - Natural voice interrupt works too

### For Developers

1. **Test Voice Features Thoroughly**
   - Test with different microphones
   - Test in different environments
   - Test interrupt scenarios

2. **Monitor Audio Quality**
   - Check for clipping
   - Monitor noise levels
   - Test latency

3. **Handle Errors Gracefully**
   - Show clear error messages
   - Provide fallback options
   - Log errors for debugging

---

*Last Updated: March 3, 2026*
