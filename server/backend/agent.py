import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import os
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY not found in environment variables.")
    raise ValueError("GOOGLE_API_KEY is not set.")

def build_qa_chain(vectorstore):
    """
    Create a QA chain using the modern LangChain approach with LCEL.
    """
    logger.info("Building the QA chain...")
    try:
        # Initialize the LLM
        logger.info("Initializing Google Generative AI LLM...")
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.3,
            convert_system_message_to_human=True
        )
        logger.info("LLM initialized successfully.")
        
        # Create retriever
        logger.info("Creating retriever from vector store...")
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
        logger.info("Retriever created successfully.")
        
        # Define prompt template
        prompt_template = """You are a helpful assistant that answers questions based on the provided YouTube video transcript context.

Context from the video:
{context}

Question: {question}

Please provide a detailed and accurate answer based on the video content. If the question cannot be answered from the transcript, please say so.

Answer:"""

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Create the chain using LCEL (LangChain Expression Language)
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)
        
        logger.info("Constructing the final QA chain with LCEL...")
        chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        logger.info("QA chain built successfully.")
        return chain
        
    except Exception as e:
        logger.error("Failed to build QA chain.", exc_info=True)
        raise