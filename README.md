# 🚀 CodeCoach — AI-Powered Coding Evaluation Platform

![React](https://img.shields.io/badge/Frontend-React%20%2B%20TS-61DBFB?logo=react)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 🌐 Live Website
**https://cody123.vercel.app/**

---

## 🌟 Overview

**CodeCoach** is an advanced **web-based coding evaluation and learning platform** powered by **Google Gemini AI**.  
It provides **secure programming assessments**, **real-time AI mentoring**, **personalized learning roadmaps**, and **competitive leaderboards**.

🔹 Multi-language support (C, C++, Python, Java, JavaScript)  
🔹 **Google Gemini AI** for chat, problem generation, code review & viva  
🔹 **Real-time code execution** via OneCompiler API  
🔹 **Supabase** for authentication, database & real-time data  
🔹 **Proctored exam environment** with tab-switch & copy-paste detection  

---

## ✨ AI Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat Assistant** | Context-aware chat knowing your current code + problem |
| 🎯 **Dynamic Problem Generator** | AI generates infinite problems by topic + difficulty |
| 💡 **Smart Progressive Hints** | 3-level hints: concept → algorithm → pseudocode |
| 🔍 **AI Code Review** | Rates code quality, efficiency, readability after run |
| 🎓 **Viva Question Generator** | AI generates 3 interview questions from your solution |

---

## ✨ Core Features

### 💻 Coding
- ⚡ Real-time code execution (Python, JS, Java, C++, C)
- 📝 Syntax-highlighted code editor per language
- 🌍 Multi-language support with per-language templates
- 🤖 AI-powered test case generation

### 🛡️ Security & Monitoring
- 🔍 Tab-switch detection during exams
- 📋 Copy/paste blocking during exams
- 🖥️ Admin proctor dashboard with live student monitoring
- 🛑 Camera monitoring during exam

### 📊 Analytics
- 🏆 Real-time competitive leaderboard from Supabase
- 📈 Monthly performance chart on profile
- 🎯 Score, Speed & Efficiency metrics per exam
- 🗺️ Personalized learning roadmap (Beginner → Medium → Expert)

---

## 🏗️ Tech Stack

**Frontend** 🎨
- React 18 + TypeScript
- Tailwind CSS + Shadcn/Radix UI
- TanStack React Query
- React Router DOM

**Backend & Database** 🔧
- Supabase (PostgreSQL + Auth + Real-time)
- Row Level Security (RLS)
- Supabase Triggers for auto profile creation

**AI Integration** 🤖
- Google Gemini 1.5 Flash API (`@google/generative-ai`)
- OneCompiler API for sandboxed code execution

**Deployment** 🚀
- Vercel (frontend)
- Supabase Cloud (backend)

---

## ⚡ Local Setup

### 1. Clone & Install
```bash
git clone <repo-url>
cd codecoach
npm install
```

### 2. Set Environment Variables
Create a `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_ONECOMPILER_API_KEY=your-rapidapi-key
```

### 3. Get API Keys
| Key | Where to get |
|---|---|
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | [supabase.com](https://supabase.com) → Project Settings → API |
| `VITE_GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) → Create API key (FREE) |
| `VITE_ONECOMPILER_API_KEY` | [rapidapi.com/onecompiler](https://rapidapi.com/OneCompiler/api/onecompiler-apis) |

### 4. Run the Supabase Schema
Paste the SQL from `supabase-schema.sql` into your Supabase SQL Editor and run it.

### 5. Start Dev Server
```bash
npm run dev
```

> ⚠️ **Note**: Run on a domain (not localhost) for camera/proctoring features to work correctly.

---

## 🗄️ Database Schema (Supabase)

```
profiles         → user stats, skill level, streak
exam_submissions → score / speed / efficiency per attempt
topic_progress   → roadmap completion tracking
achievements     → unlocked badges
```

---

## 🤖 AI Flow (Gemini)

```
User asks question
       ↓
gemini.ts builds context (current code + problem + language + chat history)
       ↓
Gemini 1.5 Flash responds
       ↓
Response streamed to chat UI
```

```
"Generate Problem" clicked
       ↓
Gemini generates JSON {title, description, examples, hints, testCases}
       ↓
Problem rendered in UI + starter code injected into editor
```

```
Code runs successfully
       ↓
Gemini reviews code → rates Quality / Efficiency / Readability (0-10)
       ↓
AI Viva generates 3 interview questions from the solution
```
