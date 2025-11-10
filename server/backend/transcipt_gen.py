from youtube_transcript_api import YouTubeTranscriptApi
import re

ytt_api = YouTubeTranscriptApi()

def extract_video_id(url):
    """
    Extract video ID from YouTube URL
    """
    print(f"Debug: Input URL: {url}")
    
    # Pattern to match YouTube video ID after 'v='
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
        r'v=([a-zA-Z0-9_-]{11})',
        r'^([a-zA-Z0-9_-]{11})$'  # Direct video ID
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            video_id = match.group(1)
            print(f"Debug: Extracted video ID: {video_id}")
            return video_id
    
    print(f"Debug: Could not extract video ID from URL")
    return None

def gettranscipt(video_url):
    print(f"Debug: Starting transcript extraction for: {video_url}")
    
    try:
        # Extract video ID from URL
        video_id = extract_video_id(video_url)
        if not video_id:
            return "Error: Could not extract video ID from URL"
        
        print(f"Debug: Fetching transcript for video ID: {video_id}")
        transcript_data = ytt_api.fetch(video_id)
        print(f"Debug: Found {len(transcript_data.snippets)} transcript snippets")
        
        transcript_text = " ".join([snippet.text for snippet in transcript_data.snippets])
        print(f"Debug: Raw transcript length: {len(transcript_text)} characters")
        
        # Remove all brackets and their contents
        transcript_text = re.sub(r'\[.*?\]', '', transcript_text)
        # Remove all parentheses and their contents
        transcript_text = re.sub(r'\(.*?\)', '', transcript_text)
        # Remove all musical symbols and special characters
        transcript_text = re.sub(r'[♪♫♬♩♭♯🎵🎶]', '', transcript_text)
        # Remove other special symbols but keep basic punctuation
        transcript_text = re.sub(r'[^\w\s.,!?;:\'-]', '', transcript_text)
        # Clean up multiple spaces and newlines
        transcript_text = re.sub(r'\s+', ' ', transcript_text)
        # Clean up multiple punctuation marks
        transcript_text = re.sub(r'[.,!?;:]{2,}', '.', transcript_text)
        # Strip and capitalize first letter
        transcript_text = transcript_text.strip()
        if transcript_text:
            transcript_text = transcript_text[0].upper() + transcript_text[1:]
        
        print(f"Debug: Cleaned transcript length: {len(transcript_text)} characters")
        print(f"Debug: First 100 characters: {transcript_text[:100]}...")
        
        return transcript_text
    except Exception as e:
        error_msg = f"Error retrieving transcript: {str(e)}"
        print(f"Debug: {error_msg}")
        return error_msg


