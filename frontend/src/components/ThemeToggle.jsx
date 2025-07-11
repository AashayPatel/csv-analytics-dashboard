// src/components/ThemeToggle.jsx
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full hover:bg-accent transition-colors"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
