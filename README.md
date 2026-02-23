<div align="center">

![University Voice Portal Banner](https://via.placeholder.com/1200x300/0f172a/3b82f6?text=University+Voice+Portal)

# 🎓 University Voice Portal

### Ask Questions. Get Instant Insights.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Live_API-purple.svg)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-green.svg)](https://supabase.com/)

**A voice-first university data assistant for administrators and stakeholders**

[Features](#-features) • [Quick Start](#-quick-start) • [Configuration](#-configuration) • [Usage](#-usage)

</div>

---

## 📖 Overview

**University Voice Portal** transforms how university administrators interact with institutional data. Simply **ask questions in natural language** and get instant answers with beautiful visualizations.

Built with **Next.js 15** and powered by **Google's Gemini 2.5 Live API**, it delivers real-time voice conversations about enrollment, attendance, GPA, and other key university metrics.

### Perfect For:
- 🎓 University Administrators
- 📊 Department Heads
- 💼 Stakeholders & Board Members
- 🏫 Educational Leaders

---

## ✨ Features

### 🎤 Voice-First Interface
- **Natural Conversation** - Just ask questions like "How many students are enrolled?"
- **Animated Voice Bot** - Beautiful visual feedback during listening/speaking
- **Interrupt Anytime** - Stop AI mid-speech with button, spacebar, or voice
- **Multi-language Support** - Responds in the language you use

### 📊 Data Visualization
- **4 Chart Types**: Bar, Line, Pie, Number displays
- **Auto-Chart Selection** - AI chooses the best visualization
- **Key Metrics Cards** - Total, average, and trend indicators
- **Clean Insights** - No technical details, just actionable data

### 🔒 Enterprise Security
- **Read-Only Access** - Only SELECT queries allowed
- **Protected Operations** - Destructive queries blocked
- **Supabase PostgreSQL** - Secure, production-ready database
- **Environment-Based Config** - No manual database setup

### 📱 Fully Responsive
- **Desktop Layout** - 3-column design (sidebar | voice | insights)
- **Mobile Optimized** - Touch-friendly interface
- **Adaptive Design** - Works on all screen sizes

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **Supabase Account** - Free tier available at [supabase.com](https://supabase.com)
- **Gemini API Key** - Get from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd university-voice-portal

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
```

### Configuration

1. **Get Supabase Credentials:**
   - Go to [supabase.com](https://supabase.com)
   - Select your project
   - Settings → Database → Connection string
   - Copy the "Pool Query" connection string (recommended) or "Direct connection"

2. **Update `.env.local`:**
```env
NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key"
DATABASE_URL="postgresql://postgres.your-project-ref:your-password@aws-0-region.pooler.supabase.com:6543/postgres"
SSL_ENABLED="true"
UNIVERSITY_NAME="Your University"
```

3. **Start Development:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📊 Database Setup

Create these tables in your Supabase PostgreSQL database:

```sql
-- Students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  enrollment_year INTEGER,
  status VARCHAR(50),
  gpa DECIMAL(3,2)
);

-- Courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  credits INTEGER,
  department VARCHAR(100),
  instructor VARCHAR(255)
);

-- Enrollments table
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  course_id INTEGER REFERENCES courses(id),
  semester VARCHAR(50),
  grade VARCHAR(2)
);

-- Faculty table
CREATE TABLE faculty (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  department VARCHAR(100),
  position VARCHAR(100),
  hire_date DATE
);
```

---

## 🎤 Usage

### Example Questions

**Enrollment:**
- "How many students are enrolled this semester?"
- "Show me enrollment by department"
- "What's our retention rate?"

**Academics:**
- "What is the average GPA?"
- "Which courses have the highest enrollment?"
- "Show me attendance rates"

**Faculty:**
- "How many faculty members do we have?"
- "What's the student to faculty ratio?"
- "Show me faculty by department"

### Voice Controls

| Action | Method |
|--------|--------|
| **Start Speaking** | Tap the microphone button |
| **Stop Listening** | Tap microphone again |
| **Interrupt AI** | Press `Space` or tap Stop button |
| **Just Start Talking** | Auto-interrupt when you speak |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              University Voice Portal                    │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │ Sidebar  │  │  Voice Bot  │  │  Insights Panel  │  │
│  │          │  │  (Center)   │  │  (Right)         │  │
│  └──────────┘  └─────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Google Gemini 2.5 Live API                 │
│  • Speech-to-Text  • NLU  • SQL Generation  • TTS      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL                        │
│  • students  • courses  • enrollments  • faculty        │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Gemini API key | Yes |
| `DATABASE_URL` | Complete Supabase connection string | Yes |
| `SSL_ENABLED` | Enable SSL | No (true) |
| `UNIVERSITY_NAME` | University name | No |

---

## 🔧 Troubleshooting

### Voice Issues

**Microphone not working:**
1. Allow microphone access when prompted
2. Check browser permissions
3. Use Chrome or Edge (best support)

**AI doesn't stop when I speak:**
1. Speak louder (detection threshold: 0.015 RMS)
2. Use manual interrupt (Space bar)
3. Reduce background noise

### Connection Issues

**Database connection failed:**
1. Verify Supabase project is active
2. Check DATABASE_URL contains correct project ref and password
3. Ensure SSL_ENABLED is true for production
4. Confirm connection string format is correct

**Schema not loading:**
1. Verify tables exist in Supabase
2. Check database permissions
3. Review browser console for errors

---

## 📱 Responsive Design

| Device | Layout |
|--------|--------|
| **Desktop** (≥1024px) | 3-column: Sidebar | Voice | Insights |
| **Tablet** (768-1023px) | 2-column: Voice | Insights |
| **Mobile** (<768px) | Single column with mobile menu |

---

## 🔒 Security

- **Read-Only Queries** - SELECT only
- **Destructive Query Blocking** - DELETE, DROP, TRUNCATE blocked
- **Result Limiting** - Max 1000 rows
- **Query Timeout** - 30 seconds
- **SSL/TLS** - Encrypted database connections

---

## 🙏 Acknowledgments

Built with:
- **[Google Gemini](https://ai.google.dev/)** - Voice AI capabilities
- **[Next.js](https://nextjs.org/)** - React framework
- **[Recharts](https://recharts.org/)** - Chart library
- **[Supabase](https://supabase.com/)** - PostgreSQL database
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling

---

## 📄 License

**Proprietary Software** - All rights reserved.

For licensing inquiries, please contact the development team.

---

<div align="center">

### 🎓 Ready to Transform Your University Data Experience?

**Start asking questions today!**

[Get Started](#-quick-start) • [View Demo](#demo) • [Documentation](#-table-of-contents)

</div>
