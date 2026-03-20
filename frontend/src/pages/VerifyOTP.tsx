import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const email = new URLSearchParams(location.search).get('email');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/users/verify-otp', { email, otp });
      dispatch(setCredentials(data));
      toast.success(data.message || 'Identity Verified!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or Expired OTP');
    }
  };

  if (!email) {
    return <div className="text-center mt-20 text-red-500 font-bold">Invalid verification portal link.</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border-t-4 border-cyan-500">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center">
          <ShieldCheck size={32} />
        </div>
      </div>
      <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-2">Check Your Email</h2>
      <p className="text-gray-500 text-center mb-6 text-sm">We've sent a 6-digit verification code to <strong>{email}</strong>.</p>
      
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Enter OTP Code</label>
          <input 
            type="text" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            className="w-full border p-3 rounded font-mono text-center text-xl tracking-widest focus:ring-2 focus:ring-cyan-500 outline-none" 
            placeholder="XXXXXX"
            maxLength={6}
            required 
          />
        </div>
        <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-3 rounded hover:bg-cyan-700 transition">
          Verify Identity
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;
