import os
import uvicorn
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from dotenv import load_dotenv
from backend.transcipt_gen import gettranscipt, extract_video_id
from backend.database import chunk_text, build_vectorstore
from backend.agent import build_qa_chain

# Load environment variables
load_dotenv()

# --- FastAPI App Initialization ---
app = FastAPI(
    title="YouTube Transcript Chatbot API",
    description="An API to chat with YouTube video transcripts.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Pydantic Models for Request Body Validation ---
class VideoURLPayload(BaseModel):
    video_url: str

class ChatPayload(BaseModel):
    question: str

# --- In-memory state (Global variables) ---
# Note: For production, consider a more robust state management solution.
vectorstore = None
qa_chain = None
current_video_url = None

# --- API Endpoints ---

@app.get('/api/health', tags=["Health"])
def health_check():
    """Health check endpoint to ensure the API is running."""
    logger.info("Health check endpoint called")
    return {
        "status": "healthy",
        "message": "YouTube Transcript Chatbot API is running"
    }

@app.post('/api/video/id', tags=["Video"])
def get_video_id(payload: VideoURLPayload):
    """Extract video ID from a given YouTube URL."""
    logger.info(f"Attempting to extract video ID from URL: {payload.video_url}")
    try:
        video_id = extract_video_id(payload.video_url)
        if not video_id:
            logger.warning(f"Invalid YouTube URL or failed to extract video ID from: {payload.video_url}")
            raise HTTPException(status_code=400, detail="Invalid YouTube URL or could not extract video ID")
        
        logger.info(f"Successfully extracted video ID: {video_id}")
        return {
            "video_id": video_id,
            "video_url": payload.video_url,
            "message": "Video ID extracted successfully"
        }
    except Exception as e:
        logger.error(f"An unexpected error occurred while extracting video ID from {payload.video_url}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to extract video ID: {str(e)}")

@app.post('/api/transcript/extract', tags=["Transcript"])
async def extract_transcript(payload: VideoURLPayload):
    """Extracts transcript, creates chunks, and builds a vector store."""
    global vectorstore, qa_chain, current_video_url
    
    logger.info(f"Starting transcript extraction for: {payload.video_url}")
    try:
        logger.info("Step 1: Fetching transcript...")
        transcript = gettranscipt(payload.video_url)
        if transcript.startswith("Error"):
            logger.error(f"Failed to fetch transcript for {payload.video_url}: {transcript}")
            raise HTTPException(status_code=400, detail=transcript)
        logger.info("Step 1: Transcript fetched successfully.")
        
        logger.info("Step 2: Chunking text...")
        chunks = chunk_text(transcript)
        logger.info(f"Step 2: Text chunked into {len(chunks)} parts.")
        
        logger.info("Step 3: Building vector store...")
        vectorstore = build_vectorstore(chunks)
        logger.info("Step 3: Vector store built successfully.")
        
        logger.info("Step 4: Building QA chain...")
        qa_chain = build_qa_chain(vectorstore)
        logger.info("Step 4: QA chain built successfully.")
        
        current_video_url = payload.video_url
        logger.info(f"Transcript extraction process completed for: {payload.video_url}")
        
        return {
            "message": "Transcript extracted successfully",
            "video_url": payload.video_url,
            "transcript_length": len(transcript),
            "chunks_count": len(chunks),
            "preview": transcript[:500] + "..." if len(transcript) > 500 else transcript
        }
    except Exception as e:
        logger.error(f"An error occurred during transcript extraction for {payload.video_url}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to extract transcript: {str(e)}")

@app.post('/api/chat', tags=["Chat"])
def chat(payload: ChatPayload):
    """Handles chat interactions with the loaded transcript."""
    global qa_chain, current_video_url
    
    logger.info(f"Received chat request for video: {current_video_url}")
    if not qa_chain:
        logger.warning("Chat request failed: No transcript is loaded.")
        raise HTTPException(status_code=400, detail="No transcript loaded. Please extract a transcript first.")
    
    try:
        logger.info(f"Invoking QA chain with question: '{payload.question}'")
        enhanced_question = f"""
        Format your response using valid Markdown. Follow these guidelines:
        - Use clear headings (##) for each section or main point
        - Use bullet points for lists
        - Bold important terms using **bold text**
        - Keep sentences short and structured
        - Do not include unnecessary introductions or disclaimers
        
        User question: {payload.question}
        """
        answer = qa_chain.invoke(enhanced_question)
        logger.info("QA chain invoked successfully and answer received.")
        
        return {
            "question": payload.question,
            "answer": answer,
            "video_url": current_video_url
        }
    except Exception as e:
        logger.error(f"An error occurred during chat processing for video {current_video_url}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process question: {str(e)}")

@app.get('/api/conversation/history', tags=["Conversation"])
def get_conversation_history():
    """(Mock) Get conversation history."""
    logger.info("Conversation history endpoint called.")
    return {
        "conversations": [],
        "message": "Conversation history feature not implemented yet"
    }

@app.get('/api/transcript/current', tags=["Transcript"])
def get_current_transcript_info():
    """Get information about the currently loaded transcript."""
    logger.info("Current transcript info endpoint called.")
    if not current_video_url or not vectorstore:
        logger.info("No transcript currently loaded.")
        return {
            "loaded": False,
            "message": "No transcript currently loaded"
        }
    
    logger.info(f"Currently loaded transcript URL: {current_video_url}")
    return {
        "loaded": True,
        "video_url": current_video_url,
        "vectorstore_available": vectorstore is not None
    }

@app.post('/api/transcript/clear', tags=["Transcript"])
def clear_transcript():
    """Clears the currently loaded transcript and vector store."""
    logger.info("Clearing current transcript and vector store.")
    global vectorstore, qa_chain, current_video_url
    
    vectorstore = None
    qa_chain = None
    current_video_url = None
    
    logger.info("Transcript and vector store cleared successfully.")
    return {"message": "Transcript cleared successfully"}

# --- Server Startup ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    print(f"🚀 Starting FastAPI server on http://0.0.0.0:{port}")
    uvicorn.run("api_server:app", host="0.0.0.0", port=port, reload=True)
