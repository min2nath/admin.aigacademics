"use client"
import { useEffect, useState } from "react"

const colors = [
  "bg-sky-400",
  "bg-sky-500",
  "bg-sky-600",
  "bg-sky-700",
  "bg-sky-800",
  "bg-sky-900",
]

export default function Loading() {
  const [colorIndex, setColorIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length)
    }, 1000) // change color every 1 second

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div
        className={`flex items-center justify-center w-40 h-40 rounded-full animate-spin ${colors[colorIndex]}`}
      >
        <span className="text-white font-bold text-center text-lg">
          AIG Hospitals
        </span>
      </div>
    </div>
  )
}
