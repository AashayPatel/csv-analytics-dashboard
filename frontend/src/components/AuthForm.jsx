import { useState } from "react"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = isLogin ? "login" : "register"
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Something went wrong")

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      alert(`✅ ${isLogin ? "Login" : "Registration"} successful!`)
    } catch (err) {
      alert("❌ " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-bold text-center">
        {isLogin ? "Login" : "Register"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </Button>
      </form>

      <p className="text-sm text-center">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  )
}
