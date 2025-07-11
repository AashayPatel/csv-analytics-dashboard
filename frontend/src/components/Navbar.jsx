import { useState } from "react"
import { ThemeToggle } from "./ThemeToggle"
import { Menu, X } from "lucide-react"
import { Button } from "./ui/button"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Charts", href: "/charts" },
    { name: "Team", href: "/team" },
  ]

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-border bg-background/90 backdrop-blur-md text-foreground shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <a href="/" className="text-xl font-semibold tracking-tight">
          📊 CSV Insights
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm hover:text-primary transition-colors"
            >
              {link.name}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Nav Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block py-2 text-sm text-muted-foreground hover:text-primary"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2">
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  )
}
