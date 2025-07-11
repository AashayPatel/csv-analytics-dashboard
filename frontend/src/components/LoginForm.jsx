// /frontend/src/components/LoginForm.jsx
import { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // ✅ Store the JWT in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login successful!");
      // Optional: Redirect to chart/dashboard page
    } catch (err) {
      alert("Login failed. Check credentials.");
      console.error("Login error:", err);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-red-600">Tailwind Works!</h1>


    <form onSubmit={handleLogin} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <Button variant="default" size="lg">Submit</Button>
    </form>
    </div>
  );
}
