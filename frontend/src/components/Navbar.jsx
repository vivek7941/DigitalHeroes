import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  // Check if current page is the Admin Panel
  const isAdminPage = location.pathname === '/admin';

  const getUserDisplayName = () => {
    if (!user || !user.email) return "Guest";
    return user.email.split('@')[0]; 
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/login');
  };

  return (
    <nav className="flex justify-between items-center p-5 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex gap-8 items-center">
        {/* LOGO */}
        <Link to="/dashboard" className="text-xl font-black italic tracking-tighter hover:opacity-80 transition-opacity flex items-center">
          <span className="text-black">Golf</span>
          <span className="text-[#22c55e]">CHARITY</span>
        </Link>
        
        <div className="hidden md:flex gap-6 items-center">
          {/* ONLY show these if the user is NOT an Admin or NOT on the Admin page */}
          {!isAdminPage && (
            <>
              <Link to="/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                Dashboard
              </Link>
              <Link to="/charities" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                Causes
              </Link>
            </>
          )}
          
          {/* Always show Admin link to Admins so they can switch back if needed */}
          {user?.role === 'Administrator' && !isAdminPage && (
            <Link to="/admin" className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">
              Admin Panel
            </Link>
          )}

          {/* If on Admin page, show a "Back to App" link instead */}
          {isAdminPage && (
            <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors">
              ← Exit Admin
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex flex-col items-end mr-2">
          <span className="text-[10px] font-black uppercase tracking-tighter text-black">
            {getUserDisplayName()}
          </span>
          <span className="text-[8px] font-bold uppercase text-gray-400 tracking-widest">
            {user?.role || 'Member'}
          </span>
        </div>

        <button 
          onClick={handleLogout} 
          className="bg-gray-100 hover:bg-black hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;