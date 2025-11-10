# YouTube Transcript Chatbot

## Project Structure

```
yt-transcript-chatbot/
├── backend/
│   ├── transcipt_gen.py    # YouTube transcript extraction
│   ├── database.py         # Vector store management
│   └── agent.py           # LLM agent for Q&A
├── frontend/              # Next.js frontend
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── styles/
├── api_server.py          # Main Flask API server
├── requirement.txt        # Python dependencies
└── .env.example          # Environment variables template
```

## Setup Instructions

### Backend Setup

1. **Install dependencies:**

   ```bash
   pip install -r requirement.txt
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env and add your GOOGLE_API_KEY
   ```

3. **Start Flask API server:**
   ```bash
   python api_server.py
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

## API Endpoints

| Method | Endpoint                  | Description                 |
| ------ | ------------------------- | --------------------------- |
| GET    | `/api/health`             | Health check                |
| POST   | `/api/transcript/extract` | Extract YouTube transcript  |
| POST   | `/api/chat`               | Send chat message           |
| GET    | `/api/transcript/current` | Get current transcript info |
| POST   | `/api/transcript/clear`   | Clear loaded transcript     |

## Features

- ✅ **YouTube URL Processing** - Extract transcripts from any YouTube video
- ✅ **Local Embeddings** - Uses HuggingFace models (no API quota limits)
- ✅ **Real-time Chat** - Interactive Q&A with video content
- ✅ **Modern UI** - Clean Next.js interface with Tailwind CSS
- ✅ **Error Handling** - Comprehensive error messages and validation
- ✅ **CORS Support** - Full frontend-backend integration

## Usage

1. **Start both servers** (backend on :5000, frontend on :3000)
2. **Enter YouTube URL** in the frontend interface
3. **Click "Extract"** to process the video transcript
4. **Ask questions** about the video content
5. **Get AI responses** based on the transcript

## Technologies Used

- **Backend:** Flask, LangChain, HuggingFace Transformers, FAISS
- **Frontend:** Next.js, React, Tailwind CSS
- **LLM:** Google Gemini (configurable)
- **Embeddings:** SentenceTransformers (local, free)
