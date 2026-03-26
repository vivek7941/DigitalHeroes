import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({ email: "", password: "", charityId: "c2" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const charities = [
    { id: "c1", name: "Green Earth Foundation" },
    { id: "c2", name: "Clean Oceans Initiative" }
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/api/auth/signup", form);
      if (response.data.success && response.data.user) {
        // Store user and charity selection
        const userWithCharity = {
          ...response.data.user,
          charityId: form.charityId,
          charityName: charities.find(c => c.id === form.charityId)?.name
        };
        localStorage.setItem("user", JSON.stringify(userWithCharity));
        
        // Immediate redirect to subscription
        setTimeout(() => {
          navigate("/subscribe");
        }, 500);
      }
    } catch (err) { 
      setError("Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h1 className="text-3xl font-black mb-2 tracking-tighter text-gray-900">JOIN THE IMPACT</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">Play for glory. Support a cause.</p>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <input 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all" 
            placeholder="Email" 
            type="email" 
            required 
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} 
          />
          <input 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all" 
            placeholder="Password" 
            type="password" 
            required 
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} 
          />
          
          <div className="pt-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Choose Your Charity</label>
            <select 
              className="w-full mt-1 p-4 bg-gray-50 rounded-2xl outline-none appearance-none font-bold" 
              value={form.charityId}
              onChange={e => setForm({...form, charityId: e.target.value})}
            >
              {charities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-[9px] text-gray-400 mt-2 ml-2">Minimum 10% of your subscription goes to your chosen charity</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold">
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:scale-[0.98] transition-all shadow-xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>

          <p className="text-[9px] text-gray-400 text-center font-bold">
            Next: Choose your subscription plan →
          </p>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">Already have an account?</p>
          <button 
            onClick={() => navigate("/login")}
            className="w-full mt-2 text-black font-black text-[11px] uppercase hover:underline"
          >
            LOG IN
          </button>
        </div>
      </div>
    </div>
  );
}