import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pageindex
from groq import Groq

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset
dataset_path = os.path.join(os.path.dirname(__file__), "dataset.json")
try:
    with open(dataset_path, "r") as f:
        dataset = json.load(f)
        problems = dataset.get("problems", [])
except FileNotFoundError:
    problems = []

# Initialize pageindex
# We index documents containing title + constraints
documents = []
for idx, p in enumerate(problems):
    doc_text = f"{p['title']} {p['constraints']}"
    documents.append((str(idx), doc_text))

# Assuming pageindex requires an api_key per the test
api_key = os.environ.get("PAGEINDEX_API_KEY", "mock_key")
try:
    client = pageindex.PageIndexClient(api_key=api_key)
    # Generic generic index assumption
    index = client.Index() if hasattr(client, "Index") else client
    for doc_id, text in documents:
        if hasattr(index, "add"):
            index.add(doc_id, text)
except Exception as e:
    print(f"Failed to initialize pageindex deeply: {e}")
    index = None

# Initialize Groq Client
# Ensure GROQ_API_KEY is an environment variable or mocked
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY", "mock_key"))

class HintRequest(BaseModel):
    title: str
    constraints: str
    code: str
    hint_level: int

@app.post("/hint")
async def get_hint(req: HintRequest):
    query = f"{req.title} {req.constraints}"
    
    # Search the index
    search_results = index.search(query, top_k=1)
    
    if not search_results:
        # Fallback if no exact match
        editorial = "No editorial found."
    else:
        # Assuming search_results is a list of (doc_id, score) or dicts
        top_match = search_results[0]
        # In case it returns dict or tuple
        doc_id = top_match[0] if isinstance(top_match, tuple) else top_match.get("id") or top_match
        try:
            matched_problem = problems[int(doc_id)]
            editorial = matched_problem["editorial"]
        except Exception:
            editorial = "Error formatting editorial."

    # Construct Prompt
    level_instruction = ""
    if req.hint_level == 1:
        level_instruction = "Point out a single flaw, or give them a conceptual nudge toward the optimal solution. Do not give code."
    elif req.hint_level == 2:
        level_instruction = "Suggest the optimal data structure and algorithmic pattern loosely based on the editorial."
    elif req.hint_level == 3:
        level_instruction = "Provide a detailed pseudocode block that leads directly to the solution based on the editorial."

    prompt = f"""
You are an expert algorithmic mentor. The user is solving '{req.title}'.
Here is the official editorial:
{editorial}

Here is the user's current code:
{req.code}

They are requesting Hint Level {req.hint_level}. {level_instruction}
"""

    try:
        completion = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are a helpful algorithmic mentor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        return {"hint": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
