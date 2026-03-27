import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/problems/*"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export default function LeetCodeHintOverlay() {  
  const [hint, setHint] = useState("")
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState(1)

  const fetchHint = async () => {
    setLoading(true)
    try {
      // Basic scraping of problem title and description/constraints (Fallback to defaults if not found)
      // LeetCode changes their DOM frequently; these are common selectors.
      const titleEl = document.querySelector('div[data-cy="question-title"]') || document.querySelector('.text-title-large')
      const title = titleEl ? titleEl.textContent : "Two Sum"
      
      const descEl = document.querySelector('div[data-track-load="description_content"]') || document.querySelector('.elfjS')
      const desc = descEl ? descEl.textContent : "Constraints: 2 <= nums.length <= 10^4"
      
      // Provide mock user code for now as Monaco editor parsing is complex and requires specific line grabs
      const code = "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass"

      const res = await fetch("http://localhost:8000/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          constraints: desc.slice(-500), 
          code,
          hint_level: level
        })
      })
      
      if (!res.ok) {
        throw new Error("API Error")
      }
      const data = await res.json()
      setHint(data.hint)
    } catch (e) {
      console.error(e)
      setHint("Failed to fetch hint. Ensure the FastAPI backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-8 right-8 bg-white p-5 rounded-2xl shadow-2xl w-80 text-slate-800 border border-slate-100 z-[9999] font-sans">
      <h2 className="text-lg font-bold mb-3 tracking-tight">💡 LeetCode AI Mentor</h2>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map(l => (
          <button 
            key={l}
            onClick={() => setLevel(l)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${level === l ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Lvl {l}
          </button>
        ))}
      </div>
      <button 
        onClick={fetchHint}
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="animate-pulse">Analyzing Code...</span>
        ) : "Get Hint"}
      </button>
      
      {hint && (
        <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto text-slate-700">
          {hint}
        </div>
      )}
    </div>
  )
}
