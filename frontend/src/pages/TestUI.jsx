import React, { useState } from "react"
import { Input } from "../components/ui/input"

export default function TestUI() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  )
}
