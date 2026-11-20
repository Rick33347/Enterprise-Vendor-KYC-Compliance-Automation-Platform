import os
import instructor
from groq import Groq
from dotenv import load_dotenv

# Import the schema and parser you already built
from app.schemas.extraction import DocumentExtraction
from app.services.document_parser import extract_text_from_pdf

# Load the .env file securely
load_dotenv()

# Initialize the Groq client and patch it with Instructor to enforce JSON schemas
client = instructor.from_groq(Groq(api_key=os.getenv("GROQ_API_KEY")))

def extract_structured_data(text: str) -> DocumentExtraction:
    """
    Passes raw text to the LLM and forces it to return data 
    matching the DocumentExtraction Pydantic model.
    """
    safe_text = text[:12000]
    # We use Llama 3.1 8B because it is blazing fast and free on Groq
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b", 
        response_model=DocumentExtraction,
        messages=[
            {
                "role": "system",
                "content": "You are an expert data extraction AI. Extract the required information from the provided document text accurately. If a field is not found, leave it blank."
            },
            {
                "role": "user",
                "content": f"Here is the document text:\n\n{text}"
            }
        ],
        temperature=0.0, # 0.0 forces deterministic, factual answers (no creative guessing)
    )
    return response

# --- Test the Full Pipeline ---
if __name__ == "__main__":
    # Path relative to the 'backend' root folder
    test_pdf_path = "app/services/sample_invoice.pdf" 
    
    print("1. Extracting raw text from PDF...")
    raw_text = extract_text_from_pdf(test_pdf_path)
    
    if "Failed to process" in raw_text or not raw_text.strip():
        print(f"Error reading PDF: {raw_text}")
    else:
        print("2. Sending text to Groq AI for structured extraction...")
        structured_data = extract_structured_data(raw_text)
        
        print("\n--- AI Extraction Results ---")
        # Print the Pydantic model as beautifully formatted JSON
        print(structured_data.model_dump_json(indent=2))