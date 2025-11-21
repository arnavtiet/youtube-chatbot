import logging
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

def chunk_text(text: str):
    """
    Split long transcript into overlapping chunks.
    """
    logger.info(f"Starting to chunk text of length: {len(text)}")
    try:
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_text(text)
        logger.info(f"Successfully split text into {len(chunks)} chunks.")
        return chunks
    except Exception as e:
        logger.error("Failed to chunk text.", exc_info=True)
        raise

def build_vectorstore(chunks):
    """
    Create FAISS vector store using local HuggingFace embeddings.
    """
    logger.info("Initializing HuggingFace embeddings...")
    try:
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        logger.info("Embeddings initialized successfully.")
        
        logger.info("Building FAISS vector store from text chunks...")
        vectorstore = FAISS.from_texts(chunks, embeddings)
        logger.info("FAISS vector store built successfully.")
        return vectorstore
    except Exception as e:
        logger.error("Failed to build vector store.", exc_info=True)
        raise
