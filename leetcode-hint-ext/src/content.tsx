import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/problems/*"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export default function LeetCodeHintOverlay() {  
  const [isOpen, setIsOpen] = useState(false)
  const [hint, setHint] = useState("")
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState(1)

  const fetchHint = async () => {
    setLoading(true)
    try {
      const titleEl = document.querySelector('div[data-cy="question-title"]') || document.querySelector('.text-title-large')
      const title = titleEl ? titleEl.textContent : "Two Sum"
      
      const descEl = document.querySelector('div[data-track-load="description_content"]') || document.querySelector('.elfjS')
      const desc = descEl ? descEl.textContent : "Constraints: 2 <= nums.length <= 10^4"
      
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
    <div 
      style={{
        position: "fixed",
        bottom: "32px",
        left: "32px",
        zIndex: 2147483647,
        pointerEvents: "auto"
      }}
      className="font-sans"
    >
      {!isOpen ? (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log("LeetCode AI: Bubble clicked, expanding...")
            setIsOpen(true)
          }}
          className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl transition-all duration-300 transform hover:scale-110 active:scale-95 border-4 border-zinc-900 cursor-pointer"
        >
          💡
        </button>
      ) : (
        <div 
          className="bg-zinc-900 p-5 rounded-2xl shadow-2xl w-80 text-zinc-100 border border-zinc-800 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span className="text-xl">💡</span> LeetCode AI
            </h2>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                console.log("LeetCode AI: Closing panel...")
                setIsOpen(false)
              }}
              className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map(l => (
              <button 
                key={l}
                onClick={() => setLevel(l)}
                style={{ flex: 1 }}
                className={`py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  level === l 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                Lvl {l}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchHint}
            disabled={loading}
            className="w-full bg-zinc-100 hover:bg-white text-zinc-900 py-2.5 rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <span className="animate-pulse">Analyzing Code...</span>
            ) : "Get Hint"}
          </button>
          
          {hint && (
            <div className="mt-4 p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-sm leading-relaxed max-h-72 overflow-y-auto text-zinc-300 custom-scrollbar prose prose-invert prose-sm">
              <ReactMarkdown 
                components={{
                  code({node, className, children, ...props}) {
                    const isInline = !className?.includes('language-');
                    return (
                      <code className={`${isInline ? 'bg-zinc-950 px-1 py-0.5 rounded text-indigo-300' : ''} font-mono text-xs`} {...props}>
                        {children}
                      </code>
                    )
                  },
                  pre({node, children, ...props}) {
                    return (
                      <pre className="bg-zinc-950 p-3 rounded-lg my-2 overflow-x-auto border border-zinc-800" {...props}>
                        {children}
                      </pre>
                    )
                  }
                }}
              >
                {hint}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
