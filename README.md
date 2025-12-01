# 🚀 CodeLab  

![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)  
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-success?logo=fastapi)  
![React](https://img.shields.io/badge/Frontend-React%20%2B%20TS-61DBFB?logo=react)  
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)  
![License](https://img.shields.io/badge/License-MIT-yellow.svg)  

---

##Live Website
https://cody123.vercel.app/

## 🌟 Overview  

**CodeLab** is an advanced **web-based coding evaluation platform**.  
It provides **secure programming assessments**, **real-time monitoring**, and **AI-powered test case generation** to make coding tests and learning more efficient.

🔹 Multi-language support (C, C++, Python, Java, SQL)  
🔹 Integrated **Monaco editor** for smooth coding experience  
🔹 **AI-based test case generation & evaluation**  
🔹 **Secure containerized execution** with Docker  

---

## ✨ Features  

### 💻 Core  
- ⚡ Real-time **code execution** inside isolated Docker containers  
- 📝 **Monaco-based IDE** with autocomplete & syntax highlighting  
- 🌍 Multi-language support – C, C++, Python, Java, SQL  
- 🤖 **Automated AI test case generation**  

### 🛡️ Security & Monitoring  
- 🔍 **Plagiarism detection** (copy-paste & similarity checks)  
- 🖥️ **Proctor dashboard** to monitor students in real-time  
- 🌐 **IP tracking & session management**  
- 🛑 **Resource-limited execution** for safety  

### ⚙️ Admin Tools  
- 👥 **Role-based user management**  
- 📊 Performance analytics & submission insights  
- 📦 Bulk **import/export of users & results**  
- 🎯 Custom test case creation  

---

## 🏗️ Tech Stack  

**Frontend** 🎨  
- React + TypeScript  
- Tailwind CSS + Shadcn UI  
- Monaco Editor  

**Backend** 🔧  
- FastAPI (Python)  
- PostgreSQL + SQLAlchemy  
- Pydantic schemas  
- JWT Authentication  

**AI Integration** 🤖  
- OpenAI API for test case generation & structured evaluation  

**Deployment** 🐳  
- Docker & Docker Compose  

---

## 📂 Project Structure  

```bash
codelb/
├── backend/ # FastAPI backend
│ ├── app/
│ │ ├── api/v1/endpoints/ # API endpoints
│ │ ├── core/ # Core configuration
│ │ ├── models/ # Database models
│ │ ├── schemas/ # Pydantic schemas
│ │ └── services/ # Business logic
│ ├── requirements.txt # Python dependencies
│ ├── Dockerfile # Backend container
│ ├── init_db.py # Database initialization
│ └── start.sh # Startup script
├── src/
│ ├── components/ # UI components
│ │ └── CodeEditor.tsx # Enhanced Monaco editor
│ ├── services/
│ │ └── api.ts # API client
│ ├── types/
│ │ └── index.ts # TypeScript interfaces
│ └── pages/
│ ├── Exam.tsx # Exam interface with APIs
│ └── StudentLogin.tsx # Authentication UI
├── docker-compose.yml # Full stack deployment
├── Dockerfile.frontend # Frontend container
└── README.md # Documentation
```

---

## ⚡ Installation & Setup  

### 📋 Prerequisites  
- Node.js **v18+**  
- Python **3.10+**  
- Docker & Docker Compose  
- PostgreSQL  
- OpenAI API key  

### 🔧 Backend Setup  
```bash
cd backend
pip install -r requirements.txt
python init_db.py
./start.sh

cd src
npm install
npm run dev
```
```
DATABASE_URL=postgresql://user:password@localhost:5432/codelab
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-api-key
```
```
docker-compose up --build -d
```

⚡ Execution Flow:

  Student submits code → stored in DB
  
  AI generates test cases → validated & saved
  
  Code runs in Docker (CPU/memory/time limited)
  
  Outputs validated against expected results
  
  Detailed feedback shown on student dashboard





