import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, MapPin, CreditCard, Banknote, BookmarkPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Checkout = () => {
  const { userInfo } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [saveToVault, setSaveToVault] = useState(false);
  const [vaultLabel, setVaultLabel] = useState('Home');

  useEffect(() => {
    if (!userInfo) {
      toast.error('Please log in or create an account to securely checkout!');
      navigate('/login');
    } else {
      const fetchAddresses = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.get('/api/users/addresses', config);
          setSavedAddresses(data);
        } catch (error) {
          console.error('Failed to load Address Vault');
        }
      };
      fetchAddresses();
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      return toast.error('Please fill in all shipping details!');
    }

    if (saveToVault) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.post('/api/users/addresses', { label: vaultLabel, address, city, postalCode, country }, config);
        toast.success(`Address safely vaulted as "${vaultLabel}"`);
      } catch (error) {
        toast.error('Could not save to Address Vault');
      }
    }

    toast.success('Details Saved! Generating Final Receipt...');
    
    navigate('/placeorder', { state: { 
      shippingAddress: { address, city, postalCode, country },
      paymentMethod
    }});
  };

  return (
    <div className="max-w-xl mx-auto mt-10 mb-20 px-4">
      <div className="flex justify-center mb-8 gap-4 items-center">
        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold border-b-2 border-cyan-500 pb-2"><MapPin/> Shipping</div>
        <div className="w-10 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold pb-2"><Package/> Payment</div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border-t-4 border-cyan-500 dark:border-cyan-400 transition-colors">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-800 pb-4">Dispatch Details</h2>
        
        {savedAddresses.length > 0 && (
          <div className="mb-6 bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-100 dark:border-cyan-900/50">
            <label className="block text-cyan-900 dark:text-cyan-300 font-extrabold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
              <MapPin size={18}/> Your Cloud Address Vault
            </label>
            <div className="flex flex-wrap gap-3">
              {savedAddresses.map((saved: any) => (
                <button 
                  key={saved._id}
                  type="button" 
                  onClick={() => { setAddress(saved.address); setCity(saved.city); setPostalCode(saved.postalCode); setCountry(saved.country); toast.success(`Auto-filled ${saved.label}!`); }}
                  className="bg-white dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 text-cyan-800 dark:text-cyan-400 font-black py-2 px-4 rounded shadow-sm border border-cyan-200 dark:border-gray-700 transition text-sm flex items-center gap-2"
                >
                  {saved.label} <span className="text-gray-400 dark:text-gray-500 font-normal">({saved.city})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4 border-t dark:border-gray-800 pt-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Street Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Enterprise Blvd" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-3 rounded outline-none focus:ring-2 focus:ring-cyan-500" required />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Silicon Valley" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-3 rounded outline-none focus:ring-2 focus:ring-cyan-500" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Postal Code</label>
              <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="90210" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-3 rounded outline-none focus:ring-2 focus:ring-cyan-500" required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-3 rounded outline-none focus:ring-2 focus:ring-cyan-500" required />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 border dark:border-gray-700 rounded mt-4">
            <label className="flex items-center gap-3 cursor-pointer text-gray-800 dark:text-gray-200 font-bold transition">
              <input type="checkbox" checked={saveToVault} onChange={(e) => setSaveToVault(e.target.checked)} className="w-5 h-5 text-cyan-600 rounded" />
              <BookmarkPlus size={20} className="text-cyan-600 dark:text-cyan-400"/> Save to Cloud Address Vault
            </label>
            {saveToVault && (
              <div className="mt-4 flex items-center gap-3 animate-fade-in">
                <span className="font-bold text-gray-600 dark:text-gray-400 text-sm">Save As:</span>
                <input type="text" value={vaultLabel} onChange={(e) => setVaultLabel(e.target.value)} placeholder="Office, Home, Mom's House..." className="flex-1 border dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white p-2 rounded focus:ring-cyan-500 outline-none shadow-sm" />
              </div>
            )}
          </div>

          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-8 mb-4 border-b dark:border-gray-800 pb-2 pt-4">Payment Method</h3>
          <div className="space-y-3 font-bold text-gray-800 dark:text-gray-200">
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition shadow-sm">
              <input type="radio" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-cyan-600 focus:ring-cyan-500" />
              <CreditCard size={20} className="text-cyan-600 dark:text-cyan-400"/> Pay Securely via Razorpay (INR)
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition shadow-sm">
              <input type="radio" value="Cash On Delivery" checked={paymentMethod === 'Cash On Delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-cyan-600 focus:ring-cyan-500" />
              <Banknote size={20} className="text-green-600 dark:text-green-500"/> Cash On Delivery (Developer Mock)
            </label>
          </div>
          
          <button type="submit" className="w-full bg-cyan-600 text-white font-black text-lg py-4 rounded-md hover:bg-cyan-700 transition mt-8 shadow-lg uppercase tracking-wider flex justify-center items-center gap-2">
            Continue To Final Receipt <Package size={22}/>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
