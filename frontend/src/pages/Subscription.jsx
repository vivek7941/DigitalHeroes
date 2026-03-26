import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const [plans, setPlans] = useState({ monthly: null, yearly: null });
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/subscription/plans/pricing');
      setPlans(res.data);
    } catch (err) {
      console.error("Error fetching plans:", err);
      // Fallback pricing
      setPlans({
        monthly: { price: 9.99, charity: 0.99 },
        yearly: { price: 99.99, charity: 10.00 }
      });
    }
  };

  const handleSubscribe = async (plan) => {
    if (!user.charityName && user.charityName !== 'System Admin') {
      alert("Please select a charity first! Go to Charities page.");
      navigate('/charities');
      return;
    }

    setLoading(true);
    setMessage("Processing payment...");

    try {
      const response = await axios.post('http://localhost:5000/api/subscription/subscribe', {
        userId: user.id,
        plan,
        charityId: user.charityId || 'c2'
      });

      if (response.data.success) {
        // Update local storage
        const updatedUser = {
          ...user,
          subscriptionStatus: 'active'
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setMessage(`✓ Payment successful! ${response.data.message}`);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error("Payment failed:", err);
      setMessage("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const monthly = plans.monthly;
  const yearly = plans.yearly;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafafa] to-gray-100 p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
            Choose Your Path
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">
            Play golf. Compete. Win prizes. Support a cause.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Monthly Plan */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`relative p-8 rounded-[2.5rem] cursor-pointer transition-all transform ${
              selectedPlan === 'monthly'
                ? 'bg-black text-white shadow-2xl scale-105'
                : 'bg-white text-black border border-gray-100 shadow-sm hover:shadow-lg'
            }`}
          >
            <div className={`absolute top-4 right-4 text-[9px] font-black uppercase px-3 py-1 rounded-full ${
              selectedPlan === 'monthly'
                ? 'bg-white text-black'
                : 'bg-gray-100 text-gray-600'
            }`}>
              Popular
            </div>

            <h2 className="text-2xl font-black uppercase mb-2">Monthly</h2>
            <p className={`text-[11px] font-bold uppercase tracking-widest mb-8 ${
              selectedPlan === 'monthly' ? 'text-gray-300' : 'text-gray-400'
            }`}>
              Play month to month
            </p>

            <div className="mb-8">
              <div className="text-5xl font-black italic mb-2">
                ${monthly?.price || '9.99'}
              </div>
              <p className={`text-[10px] font-bold uppercase ${
                selectedPlan === 'monthly' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                per month
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <p className="text-[11px] font-bold">Unlimited score entry</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <p className="text-[11px] font-bold">Monthly draw entries</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <p className="text-[11px] font-bold">
                  ${monthly?.charity || '0.99'} to charity
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-wide transition-all ${
                selectedPlan === 'monthly'
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-900'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div
            onClick={() => setSelectedPlan('yearly')}
            className={`relative p-8 rounded-[2.5rem] cursor-pointer transition-all transform ${
              selectedPlan === 'yearly'
                ? 'bg-black text-white shadow-2xl scale-105'
                : 'bg-white text-black border border-gray-100 shadow-sm hover:shadow-lg'
            }`}
          >
            <div className={`absolute top-4 right-4 text-[9px] font-black uppercase px-3 py-1 rounded-full ${
              selectedPlan === 'yearly'
                ? 'bg-green-400 text-black'
                : 'bg-green-100 text-green-600'
            }`}>
              Save 17%
            </div>

            <h2 className="text-2xl font-black uppercase mb-2">Yearly</h2>
            <p className={`text-[11px] font-bold uppercase tracking-widest mb-8 ${
              selectedPlan === 'yearly' ? 'text-gray-300' : 'text-gray-400'
            }`}>
              Best value commitment
            </p>

            <div className="mb-8">
              <div className="text-5xl font-black italic mb-2">
                ${yearly?.price || '99.99'}
              </div>
              <p className={`text-[10px] font-bold uppercase ${
                selectedPlan === 'yearly' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                per year (${(yearly?.price / 12).toFixed(2) || '8.33'}/mo)
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <p className="text-[11px] font-bold">Unlimited score entry</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <p className="text-[11px] font-bold">12 monthly draws</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <p className="text-[11px] font-bold">
                  ${yearly?.charity || '10.00'} to charity
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <p className="text-[11px] font-bold">Cancel anytime</p>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-wide transition-all ${
                selectedPlan === 'yearly'
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-900'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>

        </div>

        {/* Message */}
        {message && (
          <div className={`text-center p-6 rounded-2xl font-black uppercase text-[11px] ${
            message.includes('successful')
              ? 'bg-green-100 text-green-600'
              : message.includes('failed')
              ? 'bg-red-100 text-red-600'
              : 'bg-blue-100 text-blue-600'
          }`}>
            {message}
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16 bg-white rounded-[2.5rem] p-8 border border-gray-100">
          <h3 className="text-2xl font-black uppercase mb-8">Payment Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-black uppercase text-[11px] text-gray-400 mb-3">Supported Methods</h4>
              <ul className="space-y-2 text-sm">
                <li>💳 Credit/Debit Cards</li>
                <li>Apple Pay</li>
                <li>Google Pay</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase text-[11px] text-gray-400 mb-3">Charity Contribution</h4>
              <p className="text-sm">
                Minimum 10% of your subscription goes directly to your chosen charity. 
                <br /><br />
                <strong>Selected: {user.charityName || 'None'}</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Subscription;
