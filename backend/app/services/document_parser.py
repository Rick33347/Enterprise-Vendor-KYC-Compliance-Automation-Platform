import fitz  # PyMuPDF

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts raw text from a digital PDF file.
    """
    extracted_text = ""
    
    try:
        # Open the PDF document
        document = fitz.open(file_path)
        
        # Iterate through each page
        for page_num in range(len(document)):
            page = document.load_page(page_num)
            # Extract text retaining basic layout/line breaks
            extracted_text += page.get_text("text") + "\n\n"
            
        return extracted_text.strip()
        
    except Exception as e:
        return f"Failed to process document: {str(e)}"

# --- Test Execution ---
if __name__ == "__main__":
    # Point this to a dummy PDF on your machine
    test_pdf_path = "sample_invoice.pdf" 
    
    print(f"--- Extracting text from {test_pdf_path} ---")
    result = extract_text_from_pdf(test_pdf_path)
    
    print(result)