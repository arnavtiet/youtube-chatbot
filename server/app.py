# app.py
import streamlit as st
from backend.transcipt_gen import gettranscipt
from backend.database import build_vectorstore,chunk_text
from backend.agent import build_qa_chain

st.set_page_config(page_title="YouTube Video Q&A", layout="wide")
st.title("🎬 YouTube Video Q&A with Gemini")

# ------------------------------
# Initialize session state
# ------------------------------
if "conversation" not in st.session_state:
    st.session_state.conversation = []

if "qa_chain" not in st.session_state:
    st.session_state.qa_chain = None

if "vectorstore_ready" not in st.session_state:
    st.session_state.vectorstore_ready = False

# ------------------------------
# Sidebar: YouTube URL input
# ------------------------------
video_url = st.text_input("Enter YouTube Video URL:")

if video_url and not st.session_state.vectorstore_ready:
    with st.spinner("Fetching transcript..."):
        transcript = gettranscipt(video_url)
    
    with st.spinner("Processing transcript and building vector store..."):
        chunks = chunk_text(transcript)
        vectorstore = build_vectorstore(chunks)
        st.session_state.qa_chain = build_qa_chain(vectorstore)
        st.session_state.vectorstore_ready = True
    
    st.success("Transcript processed and QA chain ready! You can start asking questions below.")

st.markdown("---")
st.subheader("Chat with the Video")

# ------------------------------
# User Question Input
# ------------------------------
query = st.text_input("Your Question:")

if query and st.session_state.vectorstore_ready:
    qa_chain = st.session_state.qa_chain
    with st.spinner("Generating answer..."):
        answer = qa_chain.invoke(query)
    
    # Store question and answer in session state
    st.session_state.conversation.append({"user": query, "ai": answer})

# ------------------------------
# Display full conversation
# ------------------------------
for chat in st.session_state.conversation:
    st.markdown(f"**You:** {chat['user']}")
    st.markdown(f"**Gemini:** {chat['ai']}")
    st.markdown("---")
