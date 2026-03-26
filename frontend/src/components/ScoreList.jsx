export default function ScoreList({ scores }) {
 
  const sortedScores = [...scores].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sortedScores.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-[2rem]">
        <p className="text-gray-400 font-medium italic">No scores recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4 px-2">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Active Entries</h4>
        <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded-full">
          {sortedScores.length} / 5 Slots Used
        </span>
      </div>
      
      {sortedScores.map((s, i) => (
        <div 
          key={s.id || i}
          className={`flex justify-between items-center p-5 rounded-2xl border transition-all ${
            i === 0 ? "bg-white border-green-500 shadow-md" : "bg-white border-gray-100 opacity-70"
          }`}
        >
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
              i === 0 ? "bg-green-500 text-white" : "bg-black text-white"
            }`}>
              {s.value}
            </div>
            <div>
              <p className="font-black text-gray-900 leading-none mb-1 uppercase tracking-tighter">Stableford Points</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          {i === 0 && (
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
              Latest
            </span>
          )}
        </div>
      ))}
      
      <p className="text-[9px] text-gray-400 text-center mt-6 uppercase tracking-[0.3em] font-bold">
        New entries replace the oldest existing round
      </p>
    </div>
  );
}