import { useState } from "react"
import "./style.css"

function IndexPopup() {
  return (
    <div className="w-64 p-5 bg-white text-slate-800 flex flex-col items-center justify-center font-sans">
      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm">
        💡
      </div>
      <h2 className="text-lg font-bold mb-2 tracking-tight text-center">LeetCode AI Mentor</h2>
      <p className="text-sm text-slate-500 text-center leading-relaxed">
        The extension is active! Go to any LeetCode problem page to see the AI Mentor overlay in the bottom right corner.
      </p>
      <a 
        href="https://leetcode.com/problemset/all/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors w-full text-center"
      >
        Go to LeetCode
      </a>
    </div>
  )
}

export default IndexPopup
