import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { logout } from '../store/authSlice';

import { ShoppingCart, LogIn, LogOut, User, Search, Menu, X, Moon, Sun, Bell } from 'lucide-react';

const Navbar = () => {
  const { cartItems } = useSelector((state: any) => state.cart);
  const { userInfo } = useSelector((state: any) => state.auth);
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    if (keyword.length > 1) {
      const fetchSuggestions = async () => {
        try {
          const { data } = await axios.get(`/api/products?keyword=${keyword}`);
          setSuggestions((data.products || data).slice(0, 5));
        } catch (error) {
          console.error(error);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [keyword]);

  // Fetch Notifications
  useEffect(() => {
    if (userInfo) {
      const fetchNotifs = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.get('/api/users/notifications', config);
          setNotifications(data);
        } catch (error) {
          console.error(error);
        }
      };
      // Poll every 15s to simulate real-time
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 15000);
      return () => clearInterval(interval);
    }
  }, [userInfo]);

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.some(n => !n.isRead)) {
      // Mark as read
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.put('/api/users/notifications/read', {}, config);
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    if (keyword.trim()) navigate(`/?keyword=${keyword}`);
    else navigate('/');
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gray-900 dark:bg-gray-950 text-white shadow-md sticky top-0 z-50 border-b border-indigo-500 dark:border-cyan-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <Link to="/" className="text-2xl font-bold tracking-wider hover:text-indigo-400 transition whitespace-nowrap flex-shrink-0">
            Nova<span className="text-cyan-400">Hardware</span>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex items-center mx-4 relative">
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search GPUs, Laptops, Peripherals..." 
              className="w-full text-black dark:text-white dark:bg-gray-800 px-4 py-2 rounded-l-md outline-none focus:ring-2 focus:ring-cyan-400 transition-colors"
            />
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-r-md transition text-black">
              <Search size={24} />
            </button>

            {suggestions.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                {suggestions.map((p) => (
                  <Link 
                    key={p._id} 
                    to={`/product/${p._id}`}
                    onClick={() => { setKeyword(''); setSuggestions([]); }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1 truncate font-bold text-sm text-gray-800 dark:text-gray-200">{p.name}</div>
                    <div className="text-cyan-700 dark:text-cyan-400 font-black text-sm">${p.price.toFixed(2)}</div>
                  </Link>
                ))}
              </div>
            )}
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5 whitespace-nowrap shrink-0">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-700 transition" 
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-300" />}
            </button>

            <Link to="/cart" className="relative hover:text-cyan-400 transition flex items-center gap-1">
              <ShoppingCart size={22} />
              <span>Cart</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-cyan-500 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartItems.reduce((a: number, c: any) => a + c.qty, 0)}
                </span>
              )}
            </Link>

            {userInfo && (
              <div className="relative">
                <button 
                  onClick={handleNotificationClick}
                  className="relative hover:text-cyan-400 transition flex items-center p-1"
                >
                  <Bell size={22} />
                  {notifications.filter((n: any) => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      {notifications.filter((n: any) => !n.isRead).length}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                      <h4 className="font-bold text-gray-800 dark:text-gray-200">System Notifications</h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">No new notifications</div>
                      ) : (
                        notifications.map((n: any) => (
                          <div key={n._id} className={`p-4 border-b border-gray-100 dark:border-gray-700 text-sm ${!n.isRead ? 'bg-cyan-50 dark:bg-cyan-900/20' : ''}`}>
                            <p className="text-gray-800 dark:text-gray-300 whitespace-normal">{n.message}</p>
                            <span className="text-xs text-gray-400 mt-1 block">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {userInfo ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-1 text-cyan-400 font-bold hover:text-cyan-300 transition">
                  <User size={22} />
                  <span>{userInfo.name.split(' ')[0]}</span>
                </Link>
                <button onClick={logoutHandler} className="flex items-center gap-1 text-red-500 hover:text-red-400 font-bold transition">
                  <LogOut size={22} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 hover:text-cyan-400 transition">
                <LogIn size={22} />
                <span>Sign In</span>
              </Link>
            )}

            {userInfo && userInfo.isAdmin && (
              <Link to="/admin" className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded transition font-bold text-sm">
                Admin
              </Link>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-800 transition">
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-300" />}
            </button>
            <button className="text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-4">
             <form onSubmit={handleSearch} className="flex items-center w-full">
                <input 
                  type="text" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search products..." 
                  className="w-full text-black dark:text-white dark:bg-gray-800 px-4 py-2 rounded-l-md outline-none"
                />
                <button type="submit" className="bg-cyan-500 px-4 py-2 rounded-r-md text-black"><Search size={22}/></button>
              </form>
              
              <div className="flex flex-col gap-4 font-bold">
                <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <ShoppingCart size={22} /> Cart ({cartItems.reduce((a: number, c: any) => a + c.qty, 0)})
                </Link>
                {userInfo ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-cyan-400 flex items-center gap-2 font-bold"><User size={22} /> My Profile</Link>
                    <button onClick={logoutHandler} className="text-red-500 flex items-center gap-2 font-bold w-full text-left"><LogOut size={22} /> Logout</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2"><LogIn size={22}/> Sign In</Link>
                )}
                {userInfo && userInfo.isAdmin && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-cyan-400 border-t border-gray-700 pt-4 mt-2 inline-block w-full">Admin Dashboard</Link>
                )}
              </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
