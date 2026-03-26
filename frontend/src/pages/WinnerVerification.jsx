import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WinnerVerification = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [winnerStatus, setWinnerStatus] = useState(null);
  
  const user = JSON.parse(localStorage.getItem("user"));
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPendingStatus();
  }, []);

  const fetchPendingStatus = async () => {
    try {
      const userId = user?.id || user?._id;
      if (!userId) {
        setWinnerStatus("Not logged in");
        return;
      }
      // Fetching from the admin verification endpoint as per PRD requirements 
      const res = await axios.get(`${API_BASE_URL}/api/admin/pending-verifications`);
      const pendingForUser = res.data.filter(w => (w.userId?._id || w.userId) === userId);
      
      if (pendingForUser.length > 0) {
        setWinnerStatus(`Pending approval (${pendingForUser.length} submission)`);
      } else {
        setWinnerStatus("No active wins awaiting verification");
      }
    } catch (err) {
      console.error("Error fetching pending status:", err);
      setWinnerStatus("No active wins");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a screenshot first.");

    setUploading(true);
    setMessage("Uploading proof...");

    const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const userId = user?.id || user?._id;
      if (!userId) {
        setMessage("You need to be logged in to submit proof.");
        setUploading(false);
        return;
      }

      // Ensure there is a pending winner entry for this user before uploading.
      const pending = await axios.get(`${API_BASE_URL}/api/admin/pending-verifications`);
      const pendingForUser = pending.data.filter(w => (w.userId?._id || w.userId) === userId);

      if (!pendingForUser.length) {
        setMessage("No winning entry found yet. Upload is not available until your win is confirmed.");
        setUploading(false);
        return;
      }

      const base64 = await readFileAsBase64(file);

      const response = await axios.post(`${API_BASE_URL}/api/admin/upload-proof`, {
        userId: userId,
        proofUrl: base64
      });

      if (response.data.success) {
        setMessage("Proof uploaded successfully. Status: PENDING ADMIN REVIEW");
        setFile(null);
        await fetchPendingStatus();
      } else {
        setMessage(response.data.message || "Failed to upload proof. Try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to upload proof. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Your Winner Status</h2>
          <div className="p-6 bg-gray-50 rounded-2xl">
            <p className="text-sm font-bold text-gray-400 uppercase">Current Status</p>
            <p className="text-2xl font-black text-gray-900 mt-2">{winnerStatus}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-sm">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-3">Upload Proof</h1>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
              Submit a screenshot of your scores to claim your prize 
            </p>
          </header>

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 hover:border-black transition-colors cursor-pointer relative text-center">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <p className="text-gray-400 font-bold text-xs uppercase">
                {file ? file.name : "Click to select screenshot"}
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-2xl text-sm font-bold uppercase text-center ${
                message.includes("successfully") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[0.98] transition-all shadow-xl disabled:bg-gray-300"
            >
              {uploading ? "SUBMITTING..." : "SUBMIT FOR REVIEW"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WinnerVerification;