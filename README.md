<div align="center">

![DataVoice Agent Banner](https://via.placeholder.com/1200x300/0f172a/10b981?text=DataVoice+Agent)

# 🎤 DataVoice Agent

### Talk to Your Database. Get Instant Answers.

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Live_API-purple.svg)](https://ai.google.dev/)

**A production-ready, voice-first database assistant powered by Google Gemini 2.5 Live API**

[Features](#-features) • [Quick Start](#-quick-start) • [Demo](#demo) • [Documentation](#-documentation) • [FAQ](#faq)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Live Demo](#-demo)
- [Quick Start](#-quick-start)
- [Voice Features](#-voice-features)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [Architecture](#-architecture)
- [Responsive Design](#-responsive-design)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**DataVoice Agent** transforms how you interact with your data. Instead of writing SQL queries, simply **ask questions in natural language** and get instant answers with beautiful visualizations.

Built with **Next.js 15** and powered by **Google's Gemini 2.5 Live API**, it delivers real-time voice conversations with human-like responses, automatic chart generation, and actionable insights.

### Why DataVoice?

| Traditional BI Tools | DataVoice Agent |
|---------------------|-----------------|
| ❌ Write complex SQL queries | ✅ Just ask in natural language |
| ❌ Static dashboards | ✅ Dynamic, conversational insights |
| ❌ No voice interaction | ✅ Real-time voice conversations |
| ❌ Robotic data dumps | ✅ Human-like, brief responses |
| ❌ Can't interrupt | ✅ Stop AI anytime mid-speech |

---

## ✨ Features

### 🎤 Voice Interface

#### Real-Time Conversation
- **Live Voice Streaming** with Google Gemini 2.5 Live API
- **Natural Language to SQL** conversion
- **Voice Responses** with clear audio playback
- **Real-time Audio Visualization** during listening/speaking

#### Interrupt Feature 🆕
Stop the AI mid-speech **three ways**:

| Method | Action |
|--------|--------|
| **Button** | Click the red "Stop" button |
| **Keyboard** | Press `Space` bar |
| **Voice** | Just start talking (auto-detect) |

#### Human-Like Responses 🆕
- Brief, conversational (2-3 sentences max)
- Uses contractions and natural language
- **References screen**: "Check the chart on screen"
- No robotic data dumps
- Shows enthusiasm for interesting findings

### 📊 Data Visualization

- **6 Chart Types**: Bar, Line, Pie, Area, Table, Single Number
- **Auto-Chart Detection** based on query results
- **Interactive Charts** powered by Recharts
- **Metrics Cards** showing total, average, and trend
- **View Toggle** between chart and table views
- **SQL Preview** with syntax highlighting

### 🔌 Database Support

- **MySQL** (5.7+)
- **PostgreSQL** (12+)
- **Demo Mode** with sample data
- **Schema Browser** with visual tree view
- **Connection Testing** before saving
- **SSL Support** for production
- **Copy to Clipboard** for table/column names

### 📱 Fully Responsive

- **Mobile** (< 1024px): Bottom drawer, hamburger menu, FAB button
- **Desktop** (≥ 1024px): Fixed sidebar, side-by-side panels
- **Touch-Friendly**: All buttons ≥ 44px
- **Dynamic Viewport**: 100dvh for mobile browsers

### 🔒 Enterprise Security

- **Read-Only Queries** by default (SELECT only)
- **Destructive Query Blocking** (DELETE, DROP, TRUNCATE, UPDATE)
- **Result Limiting** (max 1000 rows)
- **Query Timeout** (30 seconds)
- **Credential Protection** (passwords not persisted)
- **SSL/TLS** support for database connections

---

## 🎬 Demo

### Try Without a Database

Enable **Demo Mode** in the connection screen to explore DataVoice with sample e-commerce data:

- **3 Sample Tables**: orders, customers, products
- **Pre-loaded Data**: 10 orders, 5 customers, 4 products
- **No Setup Required**: Instant testing

### Example Conversation

```
┌─────────────────────────────────────────────────────────┐
│ 👤 You: "Show me our total revenue"                     │
│                                                         │
│ 🤖 DataVoice: "Your total revenue is $1.25M. The       │
│     chart on screen shows monthly trends - you'll see  │
│     we peaked in December. Pretty nice growth! Want    │
│     to dive into any specific month?"                   │
│                                                         │
│ 📊 [Bar chart appears showing monthly revenue]          │
│ 📋 [SQL preview: SELECT month, SUM(revenue)...]        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)
- **MySQL or PostgreSQL** database (optional - demo mode available)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/datavoice-agent.git
cd datavoice-agent

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Gemini API key
# NEXT_PUBLIC_GEMINI_API_KEY="your_actual_key"

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Connection

1. **Enable Demo Mode** (recommended for first-time users)
2. Click **"Save & Connect"**
3. Navigate to **Dashboard**
4. Click **Connect** to start voice session
5. Click **Microphone** and ask: *"Show me total sales"*

---

## 🎤 Voice Features

### Interrupt System

DataVoice introduces an advanced interrupt system for natural conversations:

#### 1. Manual Interrupt (Button)
A red **"Stop"** button appears when AI speaks. Click to interrupt immediately.

#### 2. Keyboard Interrupt (Space Bar)
Press `Space` to stop AI mid-sentence. Perfect for quick corrections.

#### 3. Voice Interrupt (Auto-Detect)
Start speaking and AI automatically detects and stops. Uses RMS-based voice activity detection.

**Technical Details:**
```typescript
// Voice Activity Detection Threshold
const VAD_THRESHOLD = 0.03;  // RMS level

// Auto-interrupt when user speaks
if (rms > VAD_THRESHOLD && isSpeaking) {
  interruptSpeaking();
}
```

### Human-Like AI Responses

#### Before (Robotic)
> "You have 150 customers. Customer 1 is Acme Corp located in North America with segment Enterprise. Customer 2 is Globex Inc located in Europe with segment SMB..."

#### After (Human)
> "You have 150 customers total. I've displayed them on screen - Acme Corp is your largest. Check out the table for the full list! Want to dive deeper?"

### Audio Quality Enhancements

| Feature | Description |
|---------|-------------|
| **Noise Gate** | Removes background noise below -50dB |
| **Audio Smoothing** | Low-pass filter eliminates crackling |
| **Echo Cancellation** | Built-in browser echo cancellation |
| **Auto Gain Control** | Automatic volume normalization |
| **Sample Rate** | 24kHz output, 16kHz input |
| **Latency** | < 100ms with 2048-sample buffer |

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# ════════════════════════════════════════════════════════
# Required: API Keys
# ════════════════════════════════════════════════════════
NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key_here"

# ════════════════════════════════════════════════════════
# Optional: Business Customization
# ════════════════════════════════════════════════════════
BUSINESS_NAME="Your Company Name"
INDUSTRY_TYPE="retail"          # retail, ecommerce, saas, healthcare, finance
DATABASE_TYPE="mysql"           # mysql or postgres
DEFAULT_CHART_TYPE="bar"        # bar, line, pie, table, number
ENABLE_DESTRUCTIVE_QUERIES="false"
CUSTOM_INSTRUCTIONS="Focus on sales metrics and customer analytics"
DEBUG_MODE="false"
```

### Business Configuration

Customize the AI for your specific industry in `lib/config.ts`:

```typescript
export const DEFAULT_CONFIG = {
  name: 'Your Business',
  industry: 'retail',  // Changes AI's domain knowledge
  keyMetrics: ['revenue', 'orders', 'customers', 'conversion_rate'],
  defaultCurrency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  customInstructions: `
    Focus on e-commerce metrics like:
    - Conversion rates
    - Average order value (AOV)
    - Customer lifetime value (CLV)
    Always show currency in USD and mention growth percentages.
  `,
};
```

### Industry Presets

Available industry configurations:

| Industry | Key Metrics |
|----------|-------------|
| **Retail** | revenue, orders, customers, average_order_value |
| **E-commerce** | revenue, orders, conversion_rate, cart_abandonment |
| **SaaS** | mrr, arr, churn_rate, active_users |
| **Healthcare** | patients, appointments, revenue, readmission_rate |
| **Finance** | assets, liabilities, transactions, roi |

---

## 📚 Usage Guide

### Step 1: Connect to Database

1. Launch the application
2. Choose **MySQL** or **PostgreSQL**
3. Enter connection details:
   - **Host**: `localhost` or IP address
   - **Port**: `3306` (MySQL) or `5432` (PostgreSQL)
   - **Database**: Your database name
   - **Username**: Database user
   - **Password**: User password
4. Click **"Test Connection"** to verify
5. Click **"Save & Connect"**

> 💡 **Tip**: Enable **Demo Mode** to test without a real database.

### Step 2: Start Voice Conversation

1. Navigate to **Dashboard** from sidebar
2. Click **"Connect"** button (establishes Gemini session)
3. Click **Microphone** button
4. Ask your question naturally

### Step 3: Review Results

Results appear in real-time across three areas:

| Area | Shows |
|------|-------|
| **Chat** | Conversation history with timestamps |
| **Results Panel** | Charts, metrics, and data tables |
| **SQL Preview** | Executed query with syntax highlighting |

### Example Questions by Category

#### Sales & Revenue
```
"Show me total sales by month"
"What was our revenue last quarter?"
"Compare this year to last year"
"Which month had the highest sales?"
```

#### Customer Analytics
```
"How many active customers do we have?"
"Show me top 10 customers by spend"
"What's our customer distribution by region?"
"Which customers haven't ordered recently?"
```

#### Product Insights
```
"Which products are low in stock?"
"Show me best-selling products"
"What's the average product price?"
"Which products have the highest margin?"
```

### Voice Controls Reference

| Action | Method |
|--------|--------|
| **Start Speaking** | Click microphone button |
| **Stop Listening** | Click microphone again |
| **Interrupt AI** | Press `Space`, click Stop button, or speak |
| **Disconnect** | Click power button |
| **Clear Chat** | Click trash icon |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Sidebar   │  │    Chat     │  │   Insights  │    │
│  │  Navigation │  │  Interface  │  │    Panel    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Voice Processing                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  use-live-gemini.ts Hook                        │   │
│  │  • Audio Capture (getUserMedia)                 │   │
│  │  • Noise Reduction                              │   │
│  │  • Voice Activity Detection                     │   │
│  │  • Interrupt Handling                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Google Gemini 2.5                      │
│  • Speech-to-Text                                       │
│  • Natural Language Understanding                       │
│  • SQL Generation                                       │
│  • Text-to-Speech                                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend API                           │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │  /api/db/   │  │  /api/db/   │                      │
│  │   query     │  │   schema    │                      │
│  └─────────────┘  └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Database Layer                         │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │    MySQL    │  │ PostgreSQL  │                      │
│  │   (mysql2)  │  │     (pg)    │                      │
│  └─────────────┘  └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### Voice Flow

```
1. User speaks
       ↓
2. Browser captures audio (getUserMedia)
       ↓
3. Noise reduction applied
       ↓
4. Downsample to 16kHz PCM
       ↓
5. Stream to Gemini Live API
       ↓
6. Gemini transcribes & understands
       ↓
7. Gemini calls run_sql_query tool
       ↓
8. Next.js API executes query
       ↓
9. Results returned to Gemini
       ↓
10. Gemini speaks response
       ↓
11. Audio played through speakers
       ↓
12. Charts/tables displayed in UI
       ↓
[Interrupt Detection runs continuously]
```

---

## 📱 Responsive Design

### Breakpoints

| Device Type | Screen Width | Layout |
|-------------|--------------|--------|
| **Mobile (Small)** | < 640px | Single column, full-width |
| **Mobile (Large)** | 640px - 767px | Single column, larger elements |
| **Tablet** | 768px - 1023px | Two-column (collapsible) |
| **Laptop** | 1024px - 1279px | Full layout with sidebar |
| **Desktop** | ≥ 1280px | Full layout with expanded sidebar |

### Mobile Features

- ✅ Hamburger menu sidebar
- ✅ Bottom sheet for insights (65vh, slides up)
- ✅ Floating action button (FAB) to toggle insights
- ✅ Full-width chat interface
- ✅ Touch-friendly buttons (≥ 44px minimum)
- ✅ Dynamic viewport height (100dvh)
- ✅ Safe area insets for notched devices

### Desktop Features

- ✅ Fixed 256px sidebar
- ✅ Chat + Insights side-by-side
- ✅ Expanded descriptions visible
- ✅ Larger charts (260px height)
- ✅ Keyboard shortcuts active

---

## 🔌 API Reference

### POST `/api/db/schema`

Fetches database schema for connected database.

**Request Body:**
```json
{
  "connection": {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "database": "ecommerce_db",
    "username": "app_user",
    "password": "secure_password",
    "ssl": false,
    "isMock": false
  }
}
```

**Response (Success - 200):**
```json
{
  "schema": [
    {
      "tableName": "orders",
      "columns": [
        {
          "name": "id",
          "type": "int",
          "isPrimaryKey": true,
          "isForeignKey": false
        },
        {
          "name": "customer_id",
          "type": "int",
          "isPrimaryKey": false,
          "isForeignKey": true
        }
      ]
    }
  ],
  "connection": {
    "type": "mysql",
    "database": "ecommerce_db",
    "tables": 5
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Failed to connect to database",
  "details": "Authentication failed for user 'app_user'"
}
```

---

### POST `/api/db/query`

Executes a SQL query against the connected database.

**Request Body:**
```json
{
  "connection": { /* connection object */ },
  "query": "SELECT * FROM orders LIMIT 10"
}
```

**Response (Success - 200):**
```json
{
  "rows": [
    { "id": 1, "customer_id": 101, "total_amount": 150.00 }
  ],
  "columns": ["id", "customer_id", "total_amount"],
  "executionTime": 0.045,
  "sql": "SELECT * FROM orders LIMIT 10"
}
```

**Security Measures:**

| Protection | Description |
|------------|-------------|
| **Query Validation** | Only SELECT, EXPLAIN, SHOW, DESCRIBE allowed |
| **Destructive Blocking** | DELETE, DROP, TRUNCATE, UPDATE, INSERT blocked |
| **Result Limiting** | Automatic LIMIT 1000 if not specified |
| **Timeout** | 30-second query timeout |
| **Error Masking** | Detailed errors hidden in production |

---

## 🔧 Troubleshooting

### Voice Issues

#### Problem: Microphone not working

**Symptoms:**
- Microphone button doesn't activate
- No audio visualization
- Browser shows microphone blocked icon

**Solutions:**
1. **Check Permissions**: Click the lock icon in browser address bar → Allow microphone
2. **Browser Compatibility**: Use Chrome or Edge (best support)
3. **Verify API Key**: Ensure `NEXT_PUBLIC_GEMINI_API_KEY` is set in `.env.local`
4. **Test Microphone**: Use another app to verify microphone works
5. **Restart Browser**: Close and reopen browser completely

#### Problem: AI doesn't stop when I speak

**Symptoms:**
- Auto-interrupt not triggering
- AI continues speaking over you

**Solutions:**
1. **Speak Louder**: Detection threshold is 0.03 RMS
2. **Check Mic Sensitivity**: Increase in system sound settings
3. **Use Manual Interrupt**: Press `Space` bar or click Stop button
4. **Reduce Background Noise**: Close windows, turn off fans

#### Problem: Audio has noise or crackling

**Symptoms:**
- Static or buzzing in voice output
- Choppy or broken audio

**Solutions:**
1. **Use Chrome/Edge**: Best audio support
2. **Check Connection**: Unstable internet causes buffering
3. **Close Other Tabs**: Free up system resources
4. **Try Different Mic**: Some mics have poor quality
5. **Clear Browser Cache**: Settings → Clear browsing data

### Database Issues

#### Problem: Connection failed

**Error Messages:**
- "ECONNREFUSED"
- "Authentication failed"
- "Database not found"

**Solutions:**
1. **Verify Host**: Should be `localhost` for local databases
2. **Check Port**: MySQL=3306, PostgreSQL=5432
3. **Test Credentials**: Try connecting with database client (e.g., MySQL Workbench)
4. **Firewall**: Ensure database port is not blocked
5. **Database Running**: Verify database service is started

#### Problem: Schema not loading

**Symptoms:**
- Schema browser shows "No tables found"
- Empty schema list

**Solutions:**
1. **Check Permissions**: User needs SELECT on information_schema
2. **Verify Database**: Ensure database contains tables
3. **Try Demo Mode**: Verify app works with sample data
4. **Check Logs**: Look for errors in browser console

### General Issues

#### Problem: App won't start

**Error:**
- "Module not found"
- "Cannot find module '@/lib/store'"

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

#### Problem: Build fails

**Error:**
- TypeScript errors
- ESLint warnings

**Solutions:**
```bash
# Check for type errors
npm run lint

# Fix TypeScript issues
npx tsc --noEmit
```

---

## 🚀 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Test production build locally
npm run start
```

### Environment Variables for Production

Set these in your hosting platform's environment:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_production_key
BUSINESS_NAME="Your Company"
INDUSTRY_TYPE="your_industry"
DATABASE_TYPE="mysql"
```

### Recommended Platforms

#### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel deploy

# Set environment variables in Vercel dashboard
```

**Why Vercel?**
- ✅ Optimized for Next.js
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration

#### Google Cloud Run
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next .next
COPY public public
EXPOSE 3000
CMD ["npm", "start"]
```

#### Other Platforms
- **AWS Amplify**: Good for AWS integration
- **Railway**: Simple deployment
- **Netlify**: Alternative to Vercel

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/datavoice-agent.git
   cd datavoice-agent
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make changes** and test thoroughly
5. **Commit** your changes:
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (auto-formatted on save)
- **Linting**: ESLint with Next.js config
- **Components**: Functional components with hooks

### Pull Request Guidelines

- ✅ Follow existing code style
- ✅ Add comments for complex logic
- ✅ Update documentation if needed
- ✅ Test on multiple browsers
- ✅ Ensure responsive design works

---

## 📄 License

**Proprietary Software** - All rights reserved.

This software is provided for evaluation and testing purposes only. Commercial use requires a valid license.

**What You Can Do:**
- ✅ Use for personal projects
- ✅ Use for testing and evaluation
- ✅ Modify for your own use
- ✅ Submit bug reports and feature requests

**What You Cannot Do:**
- ❌ Redistribute without permission
- ❌ Use for commercial purposes without license
- ❌ Remove copyright notices
- ❌ Reverse engineer the proprietary components

For licensing inquiries, please contact the development team.

---

## 🙏 Acknowledgments

DataVoice Agent is built with amazing open-source technologies:

- **[Google Gemini](https://ai.google.dev/)** - Live voice AI capabilities
- **[Next.js](https://nextjs.org/)** - React framework by Vercel
- **[Recharts](https://recharts.org/)** - Beautiful chart library
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Simple state management
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icons library
- **[mysql2](https://www.npmjs.com/package/mysql2)** - MySQL database driver
- **[pg](https://www.npmjs.com/package/pg)** - PostgreSQL database driver

Thank you to all the maintainers and contributors!

---

## ❓ FAQ

### Is my database secure?

**Yes!** DataVoice implements multiple security layers:
- Passwords never persisted to localStorage
- Only SELECT queries allowed by default
- Destructive queries (DELETE, DROP, etc.) blocked
- SSL/TLS support for database connections
- Query result limiting (max 1000 rows)
- 30-second query timeout

### Can I use this with my existing database?

**Absolutely!** DataVoice supports:
- MySQL 5.7 and above
- PostgreSQL 12 and above
- Any database schema (AI adapts automatically)

### Do I need to modify my database schema?

**No!** DataVoice works with your existing schema. The AI automatically introspects your tables and columns.

### What if I don't have a database?

**No problem!** Enable **Demo Mode** to explore DataVoice with sample e-commerce data. Perfect for testing and demos.

### Can I customize the AI's personality?

**Yes!** Edit the system prompt in `hooks/use-live-gemini.ts` to match your brand voice and industry.

### Is there a mobile app?

**Not yet**, but the web app is fully responsive and works great on mobile browsers. You can add it to your home screen for app-like experience.

### What browsers are supported?

**Best Experience:**
- ✅ Chrome 120+ (Recommended)
- ✅ Edge 120+

**Limited Support:**
- ⚠️ Firefox (may need flags enabled)
- ⚠️ Safari (use text chat fallback)

---

## 📞 Support

Need help? We're here for you!

### Documentation
- 📖 [Full Documentation](#-table-of-contents)
- 🚀 [Quick Start Guide](#-quick-start)
- 🔧 [Troubleshooting](#-troubleshooting)

### Get Help
1. **Check Documentation**: Most questions answered in this README
2. **Browser Console**: Check for error messages (F12)
3. **Demo Mode**: Test with demo data to isolate issues

### Report Issues
- 🐛 **Bug Report**: Create an issue with steps to reproduce
- 💡 **Feature Request**: Suggest new features via issues
- ❓ **Question**: Use GitHub Discussions for questions

---

<div align="center">

### 🎤 Ready to Transform How You Interact with Data?

**Get started in 5 minutes:**

```bash
git clone https://github.com/your-org/datavoice-agent.git
cd datavoice-agent
npm install
npm run dev
```

[![Documentation](https://img.shields.io/badge/View-Full_Docs-blue?style=for-the-badge)](#-table-of-contents)
[![Try Demo](https://img.shields.io/badge/Try-Demo_Mode-green?style=for-the-badge)](#demo)
[![Report Issue](https://img.shields.io/badge/Report-Issue-red?style=for-the-badge)](issues)

---

**DataVoice Agent** • Natural Voice Conversations with Your Database

Made with ❤️ using Next.js, Google Gemini, and TypeScript

</div>
