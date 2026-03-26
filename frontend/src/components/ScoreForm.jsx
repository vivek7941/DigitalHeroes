import { useState } from "react";

export default function ScoreForm({ onAdd }) {
  const [score, setScore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const scoreVal = parseInt(score);

    
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      setError("Score must be between 1 and 45 points.");
      return;
    }

    setError("");
    onAdd({ value: scoreVal, date });
    setScore("");
  };

  return (
    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Points (1-45)"
            className="w-full p-4 bg-white rounded-2xl outline-none focus:ring-2 focus:ring-black font-bold text-lg transition-all"
          />
        </div>
        <div className="flex-1">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 bg-white rounded-2xl outline-none focus:ring-2 focus:ring-black font-medium transition-all"
          />
        </div>
        <button 
          type="submit"
          className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
        >
          Post Round
        </button>
      </form>
      {error && <p className="mt-3 text-red-500 text-xs font-bold ml-2">{error}</p>}
    </div>
  );
}