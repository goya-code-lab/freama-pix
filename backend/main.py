import sys
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from api import router as api_router

app = FastAPI(title="Flea Market Image Converter API")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("--- FATAL ERROR EXCEPTION ---")
    traceback.print_exc()
    print("-----------------------------")
    return JSONResponse(status_code=500, content={"detail": str(exc)})

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost",
        "https://freama-pix.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Flea Market API is running!"}

@app.get("/health")
def health():
    return {"status": "ok"}
