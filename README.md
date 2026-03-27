# LeetCode Hint Extension

A full-stack project featuring a browser extension and a FastAPI backend designed to give you AI-powered conceptual hints on LeetCode using PageIndex lexical search and Groq LLM.

## Tech Stack
* **Frontend:** React + Tailwind CSS + Plasmo Browser Extension Framework
* **Backend:** Python + FastAPI + PageIndex (Lexical Search) + Groq (LLM Inference)

## Setup & Running

### 1. Backend (FastAPI + Groq + PageIndex)
The backend requires API keys for `pageindex` and `groq` to retrieve edits and generate hints.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Set your API keys:
```bash
export GROQ_API_KEY="your-groq-api-key"
export PAGEINDEX_API_KEY="your-pageindex-api-key"
```

Start the FastAPI server:
```bash
python main.py
```
*The API will be available on `http://localhost:8000`.*

### 2. Extension (Plasmo + React)
The extension code runs as a content script overlay on `leetcode.com`.

```bash
cd leetcode-hint-ext
npm install
npm run dev
```

* Load the extension into your browser:
* In Chrome, go to `chrome://extensions/`.
* Enable **Developer mode**.
* Click **Load unpacked** and select the `leetcode-hint-ext/build/chrome-mv3-dev` directory.
* Go to a LeetCode problem page (e.g., `leetcode.com/problems/two-sum`) to see the Floating Hint Overlay!
