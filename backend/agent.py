from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import os
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def build_qa_chain(vectorstore):
    """
    Create a QA chain using the modern LangChain approach with LCEL.
    """    # Initialize the LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.3,
        convert_system_message_to_human=False  # disables internal embed-based memory
    )
    
    # Create retriever
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    
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
    
    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return chain