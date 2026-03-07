from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from pydantic import BaseModel
from huggingface_hub import InferenceClient
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-image-studio-nu.vercel.app",
        "https://ai-image-studio-f2vyjljza-nandita1366s-projects.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    prompt: str

@app.get("/")
def home():
    return {"message": "Backend running!", "api_key_loaded": bool(os.getenv("HUGGINGFACE_API_TOKEN"))}

@app.post("/generate")
def generate_image(request: ImageRequest):
    client = InferenceClient(api_key=os.getenv("HUGGINGFACE_API_TOKEN"))
    image = client.text_to_image(
        request.prompt,
        model="stabilityai/stable-diffusion-xl-base-1.0",
    )
    image.save("output.png")
    return {"image_url": "http://localhost:8000/image", "status": "success"}

@app.get("/image")
def get_image():
    return FileResponse("output.png", media_type="image/png")