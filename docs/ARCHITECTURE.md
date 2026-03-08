# 🏗️ VoxQuery Architecture

> Comprehensive technical architecture documentation for the VoxQuery voice-first database assistant.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [High-Level Architecture](#high-level-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Voice Processing Pipeline](#voice-processing-pipeline)
- [Security Architecture](#security-architecture)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)

---

## System Overview

**VoxQuery** is a production-ready, voice-first database assistant that enables natural language conversations with your data. Built on **Next.js 15** and powered by **Google Gemini 2.5 Live API**, it transforms how users interact with databases through real-time voice conversations and automatic data visualization.

### Core Capabilities

| Capability | Description |
|------------|-------------|
| 🎤 **Voice Interface** | Real-time bidirectional voice communication with AI |
| 🧠 **Natural Language Understanding** | Converts spoken questions to SQL queries |
| 📊 **Auto-Visualization** | Automatically generates appropriate charts from query results |
| 🔌 **Multi-Database Support** | MySQL and PostgreSQL with demo mode |
| 🔒 **Enterprise Security** | Read-only queries, result limiting, query timeouts |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Sidebar    │  │  Chat        │  │  Insights    │                 │
│  │  Navigation  │  │  Interface   │  │  Panel       │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                           │                                            │
│                    ┌──────┴──────┐                                     │
│                    │  Zustand    │                                     │
│                    │   Store     │                                     │
│                    └──────┬──────┘                                     │
└───────────────────────────┼─────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      VOICE PROCESSING LAYER                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    useLiveGemini Hook                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │  │
│  │  │   Audio     │  │    Voice    │  │   Interrupt │              │  │
│  │  │   Capture   │  │  Detection  │  │   Handler   │              │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      AI LAYER (Google Gemini 2.5)                       │
│  • Speech-to-Text (STS)                                                 │
│  • Natural Language Understanding (NLU)                                 │
│  • SQL Generation                                                       │
│  • Text-to-Speech (TTS)                                                 │
│  • Tool Calling (run_sql_query)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js)                             │
│  ┌─────────────────────┐  ┌─────────────────────┐                      │
│  │  POST /api/db/query │  │  POST /api/db/schema│                      │
│  │  • Query validation │  │  • Schema fetch     │                      │
│  │  • Security checks  │  │  • Connection test  │                      │
│  │  • Result limiting  │  │  • Table metadata   │                      │
│  └─────────────────────┘  └─────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE ABSTRACTION LAYER                         │
│  ┌─────────────────────┐  ┌─────────────────────┐                      │
│  │   MySQL Driver      │  │  PostgreSQL Driver  │                      │
│  │   (mysql2)          │  │  (pg)               │                      │
│  └─────────────────────┘  └─────────────────────┘                      │
│  ┌─────────────────────┐                                              │
│  │   Mock Data Layer   │  (Demo Mode)                                 │
│  └─────────────────────┘                                              │
└─────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASES                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │    MySQL     │  │  PostgreSQL  │  │  Demo Data   │                 │
│  │   (5.7+)     │  │   (12+)      │  │  (In-Memory) │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
components/
├── AppShell.tsx          # Main application container with responsive layout
├── Sidebar.tsx           # Navigation sidebar with menu items
├── Header.tsx            # Top header with branding and controls
├── ConnectionForm.tsx    # Database connection configuration form
├── SchemaBrowser.tsx     # Visual database schema explorer
├── ChatInterface.tsx     # Voice chat interface with microphone controls
├── Visualization.tsx     # Chart rendering component (Recharts)
└── InsightCanvas.tsx     # Results panel with charts and tables
```

### Component Hierarchy

```
AppShell
├── Sidebar
│   ├── Logo
│   ├── Navigation Links
│   └── Connection Status
│
├── Main Content Area
│   │
│   ├── ConnectionView
│   │   ├── ConnectionForm
│   │   │   ├── Database Type Selector
│   │   │   ├── Connection Fields
│   │   │   └── Test/Save Buttons
│   │   └── SchemaBrowser
│   │       ├── Table Tree
│   │       └── Column Details
│   │
│   └── DashboardView
│       ├── ChatInterface
│       │   ├── Header (Connect/Clear/Disconnect)
│       │   ├── Message List
│       │   │   ├── User Message
│       │   │   └── Assistant Message
│       │   │       ├── Voice Indicator
│       │   │       ├── Content
│       │   │       └── Timestamp
│       │   └── Voice Controls
│       │       ├── Microphone Button
│       │       ├── Stop Button
│       │       └── Audio Visualizer
│       │
│       └── InsightCanvas
│           ├── Chart Selector
│           ├── Visualization
│           │   ├── BarChart
│           │   ├── LineChart
│           │   ├── PieChart
│           │   ├── AreaChart
│           │   ├── NumberCard
│           │   └── DataTable
│           └── SQL Preview
```

### State Management (Zustand)

```typescript
interface AppState {
  // Database Connection
  connection: DatabaseConnection | null;
  setConnection: (conn) => void;

  // Schema
  schema: TableSchema[];
  setSchema: (schema) => void;

  // Conversation
  messages: Message[];
  addMessage: (msg) => void;
  clearMessages: () => void;

  // Processing State
  isProcessing: boolean;
  setIsProcessing: (isProcessing) => void;

  // Voice State
  isListening: boolean;
  setIsListening: (isListening) => void;
  isSpeaking: boolean;
  setIsSpeaking: (isSpeaking) => void;

  // Navigation
  activeView: 'dashboard' | 'connection';
  setActiveView: (view) => void;

  // Visualization
  selectedChartType: ChartType | null;
  setSelectedChartType: (type) => void;
  viewMode: 'chart' | 'table';
  setViewMode: (mode) => void;
}
```

---

## Data Flow

### Voice Query Flow

```
1. User speaks into microphone
         │
         ▼
2. Audio captured via getUserMedia API
         │
         ▼
3. Noise reduction & voice activity detection
         │
         ▼
4. PCM audio streamed to Gemini Live API (16kHz)
         │
         ▼
5. Gemini transcribes speech → text
         │
         ▼
6. Gemini understands intent & generates SQL
         │
         ▼
7. Gemini calls run_sql_query tool
         │
         ▼
8. Next.js API receives tool call
         │
         ▼
9. API validates query (security checks)
         │
         ▼
10. Query executed against database
         │
         ▼
11. Results returned to Gemini
         │
         ▼
12. Gemini generates natural language response
         │
         ▼
13. Response audio streamed back (24kHz)
         │
         ▼
14. Audio played through speakers
         │
         ▼
15. Charts/tables displayed in UI
```

### Interrupt Flow

```
User speaks while AI is talking
         │
         ▼
RMS-based voice activity detection triggers
         │
         ▼
interruptSpeaking() called
         │
         ▼
Audio queue cleared immediately
         │
         ▼
Audio sources stopped
         │
         ▼
Gain faded out (10ms)
         │
         ▼
isSpeaking state → false
         │
         ▼
isListening state → true
         │
         ▼
User can now speak
```

---

## Voice Processing Pipeline

### Audio Input Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    INPUT AUDIO PIPELINE                         │
│                                                                 │
│  Microphone → Noise Gate → RMS Detection → Downsample → Gemini │
│     │            │              │              │                │
│  getUserMedia  -50dB        0.015 RMS      16kHz PCM           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Audio Output Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                   OUTPUT AUDIO PIPELINE                         │
│                                                                 │
│  Gemini → Base64 PCM → Decode → Gain → Compressor → Speakers   │
│              │           │       │         │                    │
│         24kHz      Float32    0.9     -40dB threshold          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Voice Activity Detection (VAD)

```typescript
// Enhanced VAD for auto-interrupt
const VOICE_ACTIVITY_THRESHOLD = 0.015;  // RMS level
const VOICE_ACTIVITY_FRAMES = 2;          // Consecutive frames

if (rms > VOICE_ACTIVITY_THRESHOLD) {
  voiceActivityCount++;
  if (voiceActivityCount >= VOICE_ACTIVITY_FRAMES && isSpeaking) {
    interruptSpeaking();
  }
}
```

---

## Security Architecture

### Query Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUERY SECURITY STACK                         │
│                                                                 │
│  Layer 1: Pattern Matching                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Block: DROP, DELETE, TRUNCATE, UPDATE, INSERT, ALTER   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  Layer 2: Query Type Validation                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Allow: SELECT, EXPLAIN, SHOW, DESCRIBE only            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  Layer 3: Result Limiting                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Auto-add LIMIT 1000 if not specified                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  Layer 4: Query Timeout                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 30-second timeout for all queries                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Credential Protection

| Security Measure | Implementation |
|-----------------|----------------|
| **Password Storage** | Passwords stored in Zustand state (memory only) |
| **Persistence** | Only connection metadata persisted to localStorage |
| **SSL Support** | Optional SSL/TLS for production databases |
| **Environment Variables** | API keys stored in `.env.local` (gitignored) |

---

## Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 15.4.9 | React framework with App Router |
| **Language** | TypeScript | 5.9.3 | Type-safe development |
| **UI Library** | React | 19.2.1 | Component framework |
| **Styling** | Tailwind CSS | 4.1.11 | Utility-first CSS |
| **Animation** | Motion | 12.23.24 | UI animations |
| **State** | Zustand | 5.0.11 | State management |
| **Charts** | Recharts | 3.7.0 | Data visualization |
| **Icons** | Lucide React | 0.553.0 | Icon library |
| **Markdown** | React Markdown | 10.1.0 | Markdown rendering |

### AI & Voice

| Technology | Version | Purpose |
|------------|---------|---------|
| **Google GenAI** | 1.17.0 | Gemini Live API client |
| **Web Audio API** | Native | Audio capture & playback |
| **Audio Context** | Native | Real-time audio processing |

### Database Drivers

| Driver | Version | Database |
|--------|---------|----------|
| **mysql2** | 3.17.4 | MySQL 5.7+ |
| **pg** | 8.11.3 | PostgreSQL 12+ |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.39.1 | Code linting |
| **TypeScript** | 5.9.3 | Type checking |
| **Autoprefixer** | 10.4.21 | CSS vendor prefixes |

---

## Directory Structure

```
VoxQuery/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── db/
│   │       ├── query/            # Query execution endpoint
│   │       │   └── route.ts
│   │       └── schema/           # Schema fetch endpoint
│   │           └── route.ts
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── not-found.tsx             # 404 page
│
├── components/                   # React Components
│   ├── AppShell.tsx              # Main app container
│   ├── ChatInterface.tsx         # Voice chat UI
│   ├── ConnectionForm.tsx        # DB connection form
│   ├── Header.tsx                # Top header
│   ├── InsightCanvas.tsx         # Results panel
│   ├── SchemaBrowser.tsx         # Schema explorer
│   ├── Sidebar.tsx               # Navigation sidebar
│   └── Visualization.tsx         # Chart components
│
├── hooks/                        # Custom React Hooks
│   ├── use-live-gemini.ts        # Gemini Live API integration
│   ├── use-mobile.ts             # Mobile detection
│   └── use-voice.ts              # Voice utilities
│
├── lib/                          # Core Libraries
│   ├── config.ts                 # Business configuration
│   ├── db-service.ts             # Database abstraction
│   ├── store.ts                  # Zustand store
│   └── utils.ts                  # Utility functions
│
├── public/                       # Static Assets
│   ├── favicons/                 # Browser icons
│   ├── Logo_dark_bg.png          # Dark background logo
│   ├── logo_light_bg.png         # Light background logo
│   └── logo-vector.png           # Vector logo
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # This file
│   ├── SETUP_GUIDE.md            # Installation guide
│   ├── API_DOCUMENTATION.md      # API reference
│   ├── CONTRIBUTING.md           # Contribution guide
│   ├── DEPLOYMENT.md             # Deployment guide
│   ├── VOICE_FEATURES.md         # Voice interface docs
│   └── CONFIGURATION.md          # Configuration guide
│
├── .env.example                  # Environment template
├── .eslintrc.json                # ESLint config
├── next.config.ts                # Next.js config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # Project overview
```

---

## Performance Considerations

### Audio Latency Optimization

| Optimization | Value | Impact |
|--------------|-------|--------|
| **Sample Rate** | 16kHz input, 24kHz output | Balanced quality/latency |
| **Buffer Size** | 1024 samples | ~21ms latency at 48kHz |
| **Latency Hint** | `interactive` | Prioritizes low latency |
| **Fade Duration** | 10ms | Smooth interrupt without clicks |

### Query Performance

| Optimization | Description |
|--------------|-------------|
| **Connection Pooling** | PostgreSQL uses connection pool |
| **Query Limits** | Auto LIMIT 1000 prevents large result sets |
| **Query Timeout** | 30-second timeout prevents hanging |
| **Mock Data** | Demo mode for testing without database |

---

## Scalability Considerations

### Current Architecture Limitations

1. **Stateless API**: Each query creates new database connection
2. **Client-Side State**: Zustand store not suitable for multi-user
3. **No Caching**: Schema and results not cached

### Future Scaling Options

1. **Connection Pooling Service**: Dedicated database connection service
2. **Redis Caching**: Cache query results and schema
3. **WebSocket Support**: Real-time bidirectional communication
4. **Multi-Tenant Support**: User authentication and isolation

---

*Last Updated: March 3, 2026*
