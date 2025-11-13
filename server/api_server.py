from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from dotenv import load_dotenv
from backend.transcipt_gen import gettranscipt, extract_video_id
from backend.database import chunk_text, build_vectorstore
from backend.agent import build_qa_chain

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS to allow all origins (for development)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Allow all origins
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Global variables to store vectorstore and qa_chain
vectorstore = None
qa_chain = None
current_video_url = None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "YouTube Transcript Chatbot API is running"
    }), 200

@app.route('/api/video/id', methods=['POST'])
def get_video_id():
    """Extract video ID from YouTube URL"""
    try:
        data = request.get_json()
        video_url = data.get('video_url')
        
        if not video_url:
            return jsonify({
                "error": "video_url is required"
            }), 400
        
        # Extract video ID using function from transcript_gen.py
        video_id = extract_video_id(video_url)
        
        if not video_id:
            return jsonify({
                "error": "Invalid YouTube URL or could not extract video ID"
            }), 400
        
        return jsonify({
            "video_id": video_id,
            "video_url": video_url,
            "message": "Video ID extracted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Failed to extract video ID: {str(e)}"
        }), 500

@app.route('/api/transcript/extract', methods=['POST'])
def extract_transcript():
    """Extract transcript from YouTube URL"""
    global vectorstore, qa_chain, current_video_url
    
    try:
        data = request.get_json()
        video_url = data.get('video_url')
        
        if not video_url:
            return jsonify({
                "error": "video_url is required"
            }), 400
        
        # Extract transcript
        transcript = gettranscipt(video_url)
        
        if transcript.startswith("Error"):
            return jsonify({
                "error": transcript
            }), 400
        
        # Create chunks and build vectorstore
        chunks = chunk_text(transcript)
        vectorstore = build_vectorstore(chunks)
        qa_chain = build_qa_chain(vectorstore)
        current_video_url = video_url
        
        return jsonify({
            "message": "Transcript extracted successfully",
            "video_url": video_url,
            "transcript_length": len(transcript),
            "chunks_count": len(chunks),
            "preview": transcript[:500] + "..." if len(transcript) > 500 else transcript
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Failed to extract transcript: {str(e)}"
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat with the transcript"""
    global qa_chain, current_video_url
    
    try:
        if not qa_chain:
            return jsonify({
                "error": "No transcript loaded. Please extract a transcript first."
            }), 400
        
        data = request.get_json()
        question = data.get('question')
        
        if not question:
            return jsonify({
                "error": "question is required"
            }), 400
        
        # Enhanced prompt with markdown formatting instructions
        enhanced_question = f"""
        Format your response using valid Markdown. Follow these guidelines:
        - Use clear headings (##) for each section or main point
        - Use bullet points for lists
        - Bold important terms using **bold text**
        - Keep sentences short and structured
        - Do not include unnecessary introductions or disclaimers
        
        User question: {question}
        """
        
        # Get answer from QA chain
        answer = qa_chain.invoke(enhanced_question)
        
        return jsonify({
            "question": question,
            "answer": answer,
            "video_url": current_video_url
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"Failed to process question: {str(e)}"
        }), 500

@app.route('/api/conversation/history', methods=['GET'])
def get_conversation_history():
    """Get conversation history (mock implementation)"""
    # This would typically be stored in a database
    return jsonify({
        "conversations": [],
        "message": "Conversation history feature not implemented yet"
    }), 200

@app.route('/api/transcript/current', methods=['GET'])
def get_current_transcript_info():
    """Get information about currently loaded transcript"""
    global current_video_url, vectorstore
    
    if not current_video_url or not vectorstore:
        return jsonify({
            "loaded": False,
            "message": "No transcript currently loaded"
        }), 200
    
    return jsonify({
        "loaded": True,
        "video_url": current_video_url,
        "vectorstore_available": vectorstore is not None
    }), 200

@app.route('/api/transcript/clear', methods=['POST'])
def clear_transcript():
    """Clear currently loaded transcript"""
    global vectorstore, qa_chain, current_video_url
    
    vectorstore = None
    qa_chain = None
    current_video_url = None
    
    return jsonify({
        "message": "Transcript cleared successfully"
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "message": "Please check the API documentation for available endpoints"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "message": "Something went wrong on the server"
    }), 500

# if __name__ == '__main__':
#     # Get configuration from environment variables
#     port = int(os.getenv('PORT', os.getenv('API_PORT', '8080')))  # Default to 8080 for Vercel, fallback to API_PORT
#     host = os.getenv('HOST', os.getenv('API_HOST', '0.0.0.0'))
#     debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
#     print("🚀 Starting YouTube Transcript Chatbot API...")
#     print("📝 Available endpoints:")
#     print("   GET  /api/health - Health check")
#     print("   POST /api/transcript/extract - Extract transcript from YouTube URL")
#     print("   POST /api/chat - Chat with transcript")
#     print("   GET  /api/transcript/current - Get current transcript info")
#     print("   POST /api/transcript/clear - Clear loaded transcript")
#     print("   GET  /api/conversation/history - Get conversation history")
    
#     print(f"\n🔧 Server configuration:")
#     print(f"   Host: {host}")
#     print(f"   Port: {port}")
#     print(f"   Debug: {debug}")
#     print(f"\n🌐 API available at: http://{host}:{port}")
#     print(f"📡 Frontend should connect to: http://localhost:{port}")
    
#     app.run(debug=debug, host=host, port=port)
if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
    print("🚀 Starting YouTube Transcript Chatbot API...")
    print("📝 Available endpoints:")
    print("   GET  /api/health - Health check")
    print("   POST /api/transcript/extract - Extract transcript from YouTube URL")
    print("   POST /api/chat - Chat with transcript")
    print("   GET  /api/transcript/current - Get current transcript info")
    print("   POST /api/transcript/clear - Clear loaded transcript")
    print("   GET  /api/conversation/history - Get conversation history")
