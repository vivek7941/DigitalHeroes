import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScoreForm from '../components/ScoreForm';
import ScoreList from '../components/ScoreList';

const Dashboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const navigate = useNavigate();
  
  // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [winnerNotification, setWinnerNotification] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    // Check for both 'id' or '_id' depending on your backend response
    if (!user || (!user.id && !user._id)) {
      navigate('/login');
    } else {
      fetchScores();
      checkWinnerStatus();
    }
  }, [user, navigate]);

  const isActive = user?.subscriptionStatus === 'active';
  const isAdmin = user?.role === 'Administrator';

  const fetchScores = async () => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/scores/${userId}`);
      setScores(response.data);
    } catch (err) {
      console.error("Error fetching personalized score:", err);
    }
  };

  const checkWinnerStatus = async () => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/pending-verifications`);
      const userWins = response.data.filter(w => w.userId === userId);
      if (userWins.length > 0) {
        setWinnerNotification({
          count: userWins.length,
          totalPrize: userWins.reduce((sum, win) => sum + win.prizeAmount, 0)
        });
      } else {
        setWinnerNotification(null);
      }
    } catch (err) {
      // Silently fail - don't show error for winner check
      console.log("Could not check winner status");
    }
  };

  // NEW: HANDLE RENEWAL
  const handleRenew = async () => {
    const userId = user?.id || user?._id;
    setRenewLoading(true);
    try {
      // Corrected to use the base URL variable
      const response = await axios.post(`${API_BASE_URL}/api/auth/renew`, { userId });
      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        alert("Subscription Renewed Successfully!");
      }
    } catch (err) {
      alert("Renewal failed. Check backend connection.");
    } finally {
      setRenewLoading(false);
    }
  };

  const handleAddScore = async (scoreData) => {
    const userId = user?.id || user?._id;
    setLoading(true);
    try {
      // Standardized to the /api/scores/add route as per your previous logic
      const response = await axios.post(`${API_BASE_URL}/api/scores/add`, {
        userId,
        value: scoreData.value,
        date: scoreData.date || new Date()
      });

      if (response.status === 201 || response.data.success) {
        fetchScores();
        checkWinnerStatus(); // Check for new wins after posting score
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Sync failed"));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans bg-[#fafafa]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className={`p-6 rounded-[2.2rem] shadow-xl relative overflow-hidden transition-all duration-500 ${isActive || isAdmin ? 'bg-green-600' : 'bg-black'}`}>
            <div className="relative z-10 text-white">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">
                {isAdmin ? 'System Overseer' : 'Member Status'}
              </p>
              <h2 className="text-xl font-black mb-2 flex items-center">
                 {isAdmin ? "System Active" : (isActive ? "Active Subscriber" : "Inactive / Lapsed")}
              </h2>
              {!isAdmin && (
                <p className="text-[10px] text-white/70 leading-tight">
                  Supporting: <span 
                    className="text-white font-bold italic underline decoration-white/50 underline-offset-2 cursor-pointer" 
                    onClick={() => navigate('/charities')}
                  >
                    {user.charityName || "Select a Charity"}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              {isAdmin ? "Platform Mode" : "Total Winnings"}
            </p>
            <p className="text-6xl font-black text-black tracking-tighter mb-4">
               {isAdmin ? "ADMIN" : `$${user.totalWon?.toFixed(2) || "0.00"}`}
            </p>
            <button 
              onClick={() => navigate(isAdmin ? '/admin' : '/verify')} 
              className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isAdmin ? 'text-red-600' : 'text-green-600'}`}
            >
              {isAdmin ? 'Open Admin Panel →' : 'Verify Payout →'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-2/3">
          <header className="mb-8">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">
              {isAdmin ? "Draw Simulation" : "Record Round"}
            </h1>
            <div className="h-1 w-12 bg-green-500 mt-1"></div>
          </header>
          
          {/* WINNER NOTIFICATION */}
          {winnerNotification && !isAdmin && (
            <div className="mb-8 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-[2rem] text-white shadow-xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-wider mb-2">
                    🎉 Congratulations! You Won!
                  </h3>
                  <p className="text-sm font-bold mb-1">
                    {winnerNotification.count} winning entr{winnerNotification.count > 1 ? 'ies' : 'y'} • Total Prize: ${winnerNotification.totalPrize.toFixed(2)}
                  </p>
                  <p className="text-xs opacity-90">
                    Upload proof of your scores to claim your prize
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/verify')}
                  className="bg-white text-orange-600 px-6 py-3 rounded-xl font-black uppercase text-sm hover:bg-gray-100 transition-all shadow-lg"
                >
                  Claim Prize →
                </button>
              </div>
            </div>
          )}
          
          <div className="mb-12">
             {isActive || isAdmin ? (
               <>
                <ScoreForm onAdd={handleAddScore} />
                {loading && (
                  <p className="text-center text-[10px] font-black mt-3 text-green-600 animate-pulse uppercase tracking-widest">
                    Syncing...
                  </p>
                )}
               </>
             ) : (
               <div className="p-12 bg-white border border-gray-100 shadow-xl rounded-[2.5rem] text-center space-y-6">
                 <div>
                    <p className="text-sm font-black text-red-500 uppercase tracking-widest mb-2">⚠ Subscription Required</p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      You need an active subscription to post rounds and enter the monthly draw.
                    </p>
                 </div>
                 <button 
                   onClick={() => navigate('/subscribe')}
                   className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg active:scale-95 text-lg"
                 >
                   Choose Your Plan →
                 </button>
               </div>
             )}
          </div>

          <div className="mt-4">
            <ScoreList scores={scores} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;