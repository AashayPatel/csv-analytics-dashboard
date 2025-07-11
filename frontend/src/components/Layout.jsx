// src/components/Layout.jsx
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"

const sidebarLinks = [
  { name: "Dashboard", href: "/" },
  { name: "Upload CSV", href: "/upload" },
  { name: "My Charts", href: "/charts" },
  { name: "Public", href: "/public" },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static z-40 transition-transform duration-300 w-64 bg-muted border-r border-border p-4`}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">📊 CSV Insights</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="block px-2 py-2 rounded hover:bg-accent text-sm"
              onClick={() => setSidebarOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="w-full border-b border-border px-4 py-3 flex items-center justify-between bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
