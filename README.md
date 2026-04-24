# HCP Interaction Logger

A premium, full-stack application designed for healthcare professionals (HCPs) to log and manage interactions with intelligent AI assistance.

## 🚀 Live Demo
**[https://polite-licorice-feb65c.netlify.app/](https://polite-licorice-feb65c.netlify.app/)**

---

## ✨ Features

### 1. Dual-Mode Logging
- **Structured Form**: A high-fidelity form for manual, detailed data entry (HCP names, interaction types, dates, notes, sentiment, etc.).
- **AI Chat Assistant**: A conversational interface that allows you to describe the interaction in natural language.

### 2. Intelligent AI Extraction
- Powered by **LangGraph** and **Groq (gemma2-9b-it)**.
- Automatically extracts structured data (name, topics, sentiment) from chat conversations and populates the form in real-time.
- Suggests AI-driven follow-up actions based on the discussion.

### 3. Premium UI/UX
- **Glassmorphism Design**: A modern, sleek dark theme with translucent panels and vibrant gradients.
- **Micro-animations**: Smooth transitions using Framer Motion and custom CSS animations.
- **Inter Font**: Clean, professional typography throughout the application.

---

## 🛠️ Tech Stack

### Frontend
- **React 19**
- **Redux Toolkit** (State Management)
- **React Router 7** (Navigation)
- **Lucide React** (Icons)
- **Vite** (Build Tool)

### Backend
- **FastAPI** (Python Web Framework)
- **LangGraph** (AI Agent Framework)
- **LangChain & Groq** (LLM Integration)
- **SQLAlchemy** (ORM / Database)
- **SQLite** (Default Local DB)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Groq API Key (Get one at [console.groq.com](https://console.groq.com/))

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Add your `GROQ_API_KEY` to the `.env` file.
6. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. From the root directory:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open **http://localhost:5173** in your browser.

---

## 📖 Usage
1. **Login/Register**: Create an account or sign in to access the dashboard.
2. **Log Interaction**: Use the split-view screen to record an HCP meeting.
3. **Chat**: Talk to the AI on the right side to automatically fill out the form on the left.
4. **Save**: Click "Save Interaction" to persist the data to the database.

---

Developed by **Pagidi Shashank**.
