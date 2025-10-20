import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>
        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded mb-3"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
          type="submit"
        >
          Login
        </button>
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </form>
    </div>
  );
}
