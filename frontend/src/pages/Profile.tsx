import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../store/authSlice';
import { Package, Truck, CheckCircle, XCircle, Settings, User, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setName(userInfo.name);
      setEmail(userInfo.email);
      
      if (activeTab === 'orders') {
        const fetchMyOrders = async () => {
          try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/orders/myorders', config);
            setOrders(data);
            setLoading(false);
          } catch (error) {
            toast.error('Failed to fetch order history');
            setLoading(false);
          }
        };
        fetchMyOrders();
      } else if (activeTab === 'wishlist') {
        const fetchWishlist = async () => {
          try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/users/wishlist', config);
            setWishlistItems(data);
            setLoading(false);
          } catch (error) {
            toast.error('Failed to load wishlist');
            setLoading(false);
          }
        };
        fetchWishlist();
      }
    }
  }, [userInfo, navigate, activeTab]);

  const submitUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put('/api/users/profile', { name, email, password }, config);
      dispatch(setCredentials(data));
      toast.success('Profile Identity Updated Successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const upgradeToPrime = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put('/api/users/prime', {}, config);
      dispatch(setCredentials(data));
      toast.success('Welcome to NovaHardware Prime! 👑');
    } catch (err) {
      toast.error('Failed to upgrade to Prime');
    }
  };

  const returnOrderHandler = async (id: string) => {
    const reason = window.prompt('Please provide a reason for the return request:');
    if (reason !== null) {
      if (reason.trim() === '') return toast.error('You must provide a valid reason.');
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.put(`/api/orders/${id}/return`, { reason }, config);
        toast.success(`Return request submitted: ${data.returnStatus}`);
        setOrders(orders.map((o) => o._id === id ? { ...o, returnStatus: 'Requested' } : o));
      } catch (err) {
        toast.error('Failed to submit return request');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border-t-4 border-cyan-500 dark:border-cyan-400 h-fit transition-colors">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-3xl font-black mb-4">
            {userInfo?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{userInfo?.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{userInfo?.email}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Package size={20}/> My Orders
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'wishlist' ? 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Heart size={20}/> My Wishlist
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'settings' ? 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Settings size={20}/> Account Settings
          </button>
        </div>
      </div>

      <div className="md:col-span-3 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border dark:border-gray-800 transition-colors">
        {activeTab === 'orders' ? (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Package className="text-cyan-500" size={28}/> Order History
            </h2>

            {loading ? (
              <p className="text-cyan-600 font-semibold animate-pulse">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
                <p className="text-xl text-gray-500 dark:text-gray-400 font-bold">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-sm border-b dark:border-gray-700">
                      <th className="p-4 rounded-tl-lg font-black">ID</th>
                      <th className="p-4 font-black">DATE</th>
                      <th className="p-4 font-black">TOTAL</th>
                      <th className="p-4 font-black">PAID</th>
                      <th className="p-4 font-black">STATUS</th>
                      <th className="p-4 rounded-tr-lg font-black">RETURN ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 dark:text-gray-300">
                    {orders.map((order: any) => (
                      <tr key={order._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="p-4 font-mono text-sm">{order._id.substring(0, 10)}...</td>
                        <td className="p-4 font-medium">{order.createdAt.substring(0, 10)}</td>
                        <td className="p-4 font-bold text-cyan-700">${order.totalPrice.toFixed(2)}</td>
                        <td className="p-4">
                          {order.isPaid ? (
                            <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-flex"><CheckCircle size={16}/> Paid</span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500 font-bold bg-red-50 px-2 py-1 rounded inline-flex"><XCircle size={16}/> No</span>
                          )}
                        </td>
                        <td className="p-4">
                          {order.status === 'Delivered' ? (
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-black bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full shadow-sm whitespace-nowrap"><CheckCircle size={16}/> Delivered</span>
                          ) : order.status === 'Out for Delivery' ? (
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-black bg-purple-50 dark:bg-purple-900/40 px-3 py-1 rounded-full shadow-sm whitespace-nowrap animate-pulse"><Truck size={16}/> Out for Delivery</span>
                          ) : order.status === 'Shipped' ? (
                            <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-black bg-cyan-50 dark:bg-cyan-900/40 px-3 py-1 rounded-full shadow-sm whitespace-nowrap"><Package size={16}/> Shipped</span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-black bg-yellow-50 dark:bg-yellow-900/40 px-3 py-1 rounded-full shadow-sm whitespace-nowrap">Processing</span>
                          )}
                        </td>
                        <td className="p-4">
                          {order.returnStatus === 'Requested' ? (
                            <span className="text-yellow-600 dark:text-yellow-400 font-extrabold text-xs uppercase bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">Return Requested</span>
                          ) : order.returnStatus === 'Approved' ? (
                            <span className="text-green-600 dark:text-green-400 font-extrabold text-xs uppercase bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Refunded</span>
                          ) : order.returnStatus === 'Rejected' ? (
                            <span className="text-red-600 dark:text-red-400 font-extrabold text-xs uppercase bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">Return Rejected</span>
                          ) : (order.isDelivered) ? (
                            <button onClick={() => returnOrderHandler(order._id)} className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white font-bold px-3 py-1 rounded transition text-sm">
                              Request Return
                            </button>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-sm italic">Waiting Delivery</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : activeTab === 'wishlist' ? (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Heart className="text-cyan-500" size={28} fill="currentColor"/> My Wishlist Vault
            </h2>

            {loading ? (
              <p className="text-cyan-600 font-semibold animate-pulse">Loading saved hardware...</p>
            ) : wishlistItems.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <Heart className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
                <p className="text-xl text-gray-500 dark:text-gray-400 font-bold">Your wishlist is currently empty.</p>
                <button onClick={() => navigate('/')} className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded shadow transition">Explore Store</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item: any) => (
                  <div key={item._id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-800 hover:shadow-cyan-500/20 hover:shadow-xl dark:hover:shadow-cyan-900/30 transition transform hover:-translate-y-1 flex flex-col">
                    <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-lg mb-4 bg-gray-100 dark:bg-gray-800" />
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate flex-1" title={item.name}>{item.name}</h3>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-cyan-700 dark:text-cyan-400 font-black text-lg">${item.price.toFixed(2)}</span>
                      <button onClick={() => navigate(`/product/${item._id}`)} className="text-sm bg-gray-900 dark:bg-cyan-600 text-white px-4 py-1.5 rounded-full shadow hover:bg-cyan-600 dark:hover:bg-cyan-500 transition font-bold">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="text-cyan-500" size={28}/> Identity Settings
            </h2>
            <form onSubmit={submitUpdateProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">New Password (Optional)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none transition-colors" />
              </div>
              <button type="submit" className="bg-cyan-600 text-white font-bold py-2.5 px-6 rounded hover:bg-cyan-700 transition w-full shadow-md">
                Update Identity
              </button>
            </form>

            <div className="mt-10 pt-8 border-t dark:border-gray-800">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">👑 NovaHardware Prime Status</h3>
              {userInfo.isPrime ? (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 p-6 rounded-lg">
                  <p className="text-indigo-800 dark:text-indigo-300 font-black text-lg">You are a Prime Member!</p>
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">Enjoy 10% off your entire cart + Free Universal Shipping on every order.</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-gray-900 to-indigo-900 dark:from-black dark:to-gray-900 p-6 rounded-lg text-white shadow-xl flex items-center justify-between border dark:border-gray-700 flex-col sm:flex-row gap-4">
                  <div>
                    <h4 className="font-black text-xl text-yellow-500 mb-1">Upgrade to Prime</h4>
                    <p className="text-sm text-gray-300 max-w-sm">Unlock permanent free shipping and a global 10% discount on all purchases.</p>
                  </div>
                  <button onClick={upgradeToPrime} className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-black px-6 py-3 rounded-full shadow-lg transition transform hover:scale-105 shrink-0">
                    Upgrade Now - Free Trial
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
