from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import traceback
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class ChatInput(BaseModel):
    prompt: str

import logging

logger = logging.getLogger("uvicorn.error")

@app.post("/api/chat")


async def chat(input: ChatInput):
    ollama_req = {"model": "mistral", "prompt": input.prompt, "stream": False}
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "http://localhost:11434/api/generate",
                json=ollama_req,
                timeout=30.0
            )
            res.raise_for_status()
            out = res.json()
            response_text = out.get("response")
            if not response_text:
                raise HTTPException(status_code=502, detail="No 'response' field in LLM output")
            return {"response": response_text}
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from LLM API: {res.text}")
        raise HTTPException(status_code=res.status_code, detail=f"LLM API HTTP error: {res.text}")
    except Exception as e:
        tb_str = traceback.format_exc()
        logger.error(f"Unexpected error: {str(e)}\nTraceback:\n{tb_str}")
        raise HTTPException(status_code=500, detail="Internal server error, check logs")