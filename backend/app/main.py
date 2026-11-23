from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.API.router import router as kyc_router

app = FastAPI(
    title="Enterprise Vendor KYC & Compliance API",
    version="1.0.0",
)

# Allow React frontend (Vite default port 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kyc_router)


@app.get("/")
def health_check():
    return {"status": "online", "message": "Vendor eKYC API is running"}