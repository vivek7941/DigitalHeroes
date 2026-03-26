import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Send credentials to the Backend (MongoDB Auth)
      const res = await API.post("/api/auth/login", { email, password });
      
      if (res.data.success) {
        const user = res.data.user;

        // 2. Store the user object (including role) in LocalStorage
        localStorage.setItem("user", JSON.stringify(user));

        // 3. ROLE-BASED REDIRECTION (PRD Requirement)
        // If the role matches "Administrator", send to Admin Panel
        if (user.role === "Administrator") {
          navigate("/admin"); 
        } else {
          // Otherwise, send to the regular Golfer Dashboard
          navigate("/dashboard");
        }
      }
    } catch (err) { 
      alert("Invalid credentials. Please check your email and password."); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="w-full max-w-sm p-10 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tighter italic">
            Golf<span className="text-green-500">CHARITY</span>
          </h2>
          <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.3em] mt-2">
            Secure Access
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-4 text-gray-400">Account Email</label>
            <input 
              className="w-full p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-2 focus:ring-black transition-all" 
              type="email" 
              placeholder="name@example.com" 
              required
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-4 text-gray-400">Security Key</label>
            <input 
              className="w-full p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-2 focus:ring-black transition-all" 
              type="password" 
              placeholder="••••••••" 
              required
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          <button className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg active:scale-95">
            Sign In
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p 
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-black transition-colors" 
            onClick={() => navigate("/signup")}
          >
            Don't have an account? <span className="text-green-500 ml-1">Join the Club</span>
          </p>
        </div>
      </div>
    </div>
  );
}