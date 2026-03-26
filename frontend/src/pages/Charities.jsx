import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Charities = () => {
  const [charities, setCharities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/charities');
      setCharities(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching charities:", err);
      // Fallback to default charities if API fails
      setCharities([
        {
          id: 'c1',
          name: 'Green Earth Foundation',
          description: 'Protecting our planet\'s forests, wildlife, and natural ecosystems',
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop',
          totalDonated: 0
        },
        {
          id: 'c2',
          name: 'Clean Oceans Initiative',
          description: 'Cleaning our oceans and protecting marine life from plastic pollution',
          imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800&auto=format&fit=crop',
          totalDonated: 0
        }
      ]);
      setLoading(false);
    }
  };

  const handleSelect = (charity) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const updatedUser = { ...user, charityName: charity.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert(`Success! You are now supporting ${charity.name}.`);
    } else {
      alert("Please log in first.");
    }
  };

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading charities...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-black">The Impact Directory</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">Direct your 10% minimum contribution to a cause you believe in</p>

          <input
            type="text"
            placeholder="Search causes..."
            className="w-full max-w-md p-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-black transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length > 0 ? (
            filtered.map((charity) => (
              <div
                key={charity.id}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img
                    src={charity.imageUrl}
                    alt={charity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black mb-2 uppercase tracking-tight">{charity.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 h-16">{charity.description}</p>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                    Total Donated: ${charity.totalDonated?.toFixed(2) || '0.00'}
                  </div>
                  <button
                    onClick={() => handleSelect(charity)}
                    className="w-full bg-black text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    Select Cause
                  </button>
                  {charity.website && (
                    <a
                      href={charity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                    >
                      Learn More →
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No charities found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Charities;