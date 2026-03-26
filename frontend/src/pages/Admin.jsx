import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  let fullImagePath = imageUrl;
  if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
    fullImagePath = `http://localhost:5000${imageUrl}`;
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl animate-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 font-black text-[10px] uppercase bg-gray-100 px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all">
          Close
        </button>
        <h2 className="text-2xl font-black italic uppercase mb-6 text-black">Proof of Score</h2>
        <div className="rounded-3xl overflow-hidden border-4 border-gray-50 bg-gray-100 aspect-square flex items-center justify-center">
          <img 
            src={fullImagePath} 
            alt="User Score" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [reports, setReports] = useState({
    activeSubscribers: 0,
    poolValue: 0,
    charityTotal: 0,
    jackpotAmount: 5000.00
  });

  const [drawResult, setDrawResult] = useState(null);
  const [selectedProof, setSelectedProof] = useState(null);
  const [pendingWinners, setPendingWinners] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // 1. FETCH ALL DATA FROM BACKEND ON LOAD
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Financials
        const resReports = await axios.get(`${API_BASE_URL}/api/admin/reports`);
        setReports(resReports.data);

        // Fetch Verification Queue
        const resWinners = await axios.get(`${API_BASE_URL}/api/admin/pending-verifications`);
        setPendingWinners(resWinners.data);
      } catch (err) {
        console.error("Error fetching admin data", err);
      }
    };
    fetchData();
  }, []);

  // 2. DRAW: Run Official Draw
  const handleRunDraw = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/run-draw`);
      
      if (res.data.success) {
        setDrawResult({
          winningNumbers: res.data.draw.winningNumbers,
          totalWinners: res.data.draw.totalWinners,
          prizes: res.data.draw.prizes,
          type: "Official"
        });
        alert(`Draw complete! ${res.data.draw.totalWinners} winners found.`);
      }
    } catch (err) {
      console.error("Draw failed", err);
      alert("Failed to run draw.");
    }
  };

  // 3. SIMULATION: Run Test Draw
  const handleSimulateDraw = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/simulate-draw`, { isSimulation: true });
      
      if (res.data.success) {
        setDrawResult({
          winningNumbers: res.data.winningNumbers,
          totalWinners: res.data.matchedUsers,
          type: "Simulation (Test)",
          isSimulation: true
        });
        alert(`Simulation complete! ${res.data.matchedUsers} potential winners.`);
      }
    } catch (err) {
      console.error("Simulation failed", err);
      alert("Failed to run simulation.");
    }
  };

  // 4. VERIFY: Approve winner
  const handleApproveWinner = async (drawId, winnerId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.post(`${API_BASE_URL}/api/admin/verify-winner/${drawId}/${winnerId}`, {
        adminId: user.id,
        isApproved: true
      });
      setPendingWinners(prev => prev.filter(w => w.winnerId !== winnerId));
      alert("Winner approved!");
    } catch (err) {
      console.error("Approval failed", err);
      alert("Failed to approve winner.");
    }
  };

  // 5. VERIFY: Reject winner
  const handleRejectWinner = async (drawId, winnerId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.post(`${API_BASE_URL}/api/admin/verify-winner/${drawId}/${winnerId}`, {
        adminId: user.id,
        isApproved: false
      });
      setPendingWinners(prev => prev.filter(w => w.winnerId !== winnerId));
      alert("Winner rejected!");
    } catch (err) {
      console.error("Rejection failed", err);
      alert("Failed to reject winner.");
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10 flex justify-between items-center">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Control Center</h1>
          <div className="bg-black text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase">System Live</div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Financial Overview</p>
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-black">{formatCurrency(reports.poolValue)}</h2>
                  <p className="text-[9px] font-bold text-gray-500 uppercase">Current Prize Pool ({reports.activeSubscribers} Users)</p>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <h2 className="text-2xl font-black text-pink-500">{formatCurrency(reports.charityTotal)}</h2>
                  <p className="text-[9px] font-bold text-gray-500 uppercase">Generated for Charities</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-lg">
              <p className="text-[10px] font-black uppercase opacity-70 mb-2">Next Jackpot</p>
              <h2 className="text-4xl font-black italic">{formatCurrency(reports.jackpotAmount)}</h2>
              <p className="text-[9px] font-medium mt-2">Includes Rollover</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-8 rounded-[2rem] border-2 transition-all ${drawResult ? 'bg-white border-green-500' : 'bg-white border-dashed border-gray-200'}`}>
              {drawResult ? (
                <div className="text-center animate-in zoom-in">
                  <p className="text-[10px] font-black uppercase text-green-600 mb-2">{drawResult.type} Result</p>
                  <div className="my-6">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-3">Winning Numbers</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {drawResult.winningNumbers?.map((num, i) => (
                        <div key={i} className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center font-black text-lg">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold uppercase mt-4 text-gray-400">{drawResult.totalWinners} Winners</p>
                  {drawResult.prizes && (
                    <div className="mt-4 space-y-2 text-[9px] font-bold uppercase">
                      <p className="text-green-600">5 Match: {formatCurrency(drawResult.prizes[5])}</p>
                      <p className="text-blue-600">4 Match: {formatCurrency(drawResult.prizes[4])}</p>
                      <p className="text-orange-600">3 Match: {formatCurrency(drawResult.prizes[3])}</p>
                    </div>
                  )}
                  {drawResult.isSimulation && (
                    <div className="mt-4 bg-yellow-100 text-yellow-600 text-[9px] font-black p-2 rounded-lg">
                       SIMULATION MODE (NOT OFFICIAL)
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-[10px] font-black text-gray-300 uppercase">Awaiting Draw</p>
                </div>
              )}
            </div>

            <div className="bg-black p-6 rounded-[2.5rem] space-y-3">
              <button onClick={handleSimulateDraw} className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-yellow-300 transition-all shadow-md">
                 Simulate Draw
              </button>
              <button onClick={handleRunDraw} className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-green-600 transition-all shadow-md">
                 Run Official Draw
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8">Pending Winner Verification</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {pendingWinners.length > 0 ? pendingWinners.map(winner => (
                <div key={winner.winnerId} className="pb-4 border-b border-gray-50 group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-black">{winner.userEmail || winner.userId || "Unknown User"}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{winner.matchCount} Numbers Matched</p>
                      <p className="text-lg font-black text-green-600 mt-1">${winner.prizeAmount?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Draw Date</p>
                      <p className="text-sm font-black">{new Date(winner.drawDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {winner.proofUrl ? (
                    <div className="mb-3">
                      <button
                        onClick={() => setSelectedProof(winner.proofUrl)}
                        className="text-[9px] font-bold text-blue-600 uppercase hover:underline"
                      >
                        View Uploaded Proof
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 uppercase mb-3">No proof uploaded yet</p>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveWinner(winner.drawId, winner.winnerId)} 
                      className="flex-1 bg-green-100 text-green-600 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-green-600 hover:text-white transition-all"
                    >
                      ✓ Approve
                    </button>
                    <button 
                      onClick={() => handleRejectWinner(winner.drawId, winner.winnerId)}
                      className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] font-bold text-gray-300 uppercase text-center py-10">No pending verifications</p>
              )}
            </div>
          </div>

        </div>
      </div>
      <ImageModal imageUrl={selectedProof} onClose={() => setSelectedProof(null)} />
    </div>
  );
};

export default AdminPanel;