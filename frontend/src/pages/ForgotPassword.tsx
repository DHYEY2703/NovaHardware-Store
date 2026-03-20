import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/users/forgot-password', { email });
      toast.success(data.message || 'OTP Sent to Email. Please check your inbox.');
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      const { data } = await axios.post('/api/users/reset-password', { email, otp, password: newPassword });
      toast.success(data.message || 'Password reset successfully');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or Expired OTP');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border-t-4 border-cyan-500">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center">
          <KeyRound size={32} />
        </div>
      </div>
      <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-2">Reset Password</h2>
      
      {!otpSent ? (
        <>
          <p className="text-gray-500 text-center mb-6 text-sm">Enter your account email to receive a recovery code.</p>
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full border p-3 rounded focus:ring-2 focus:ring-cyan-500 outline-none" 
                placeholder="johndoe@example.com" 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-3 rounded hover:bg-cyan-700 transition">
              Send Recovery PIN
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="text-gray-500 text-center mb-6 text-sm">We've sent a 6-digit confirmation code to <strong>{email}</strong>.</p>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Recovery PIN</label>
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
            <div>
              <label className="block text-gray-700 font-medium mb-1">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="w-full border p-3 rounded focus:ring-2 focus:ring-cyan-500 outline-none" 
                placeholder="••••••••"
                required 
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full border p-3 rounded focus:ring-2 focus:ring-cyan-500 outline-none" 
                placeholder="••••••••"
                required 
              />
            </div>
            <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-3 rounded hover:bg-cyan-700 transition">
              Confirm & Reset
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-gray-600">
        Remembered your password?{' '}
        <Link to="/login" className="text-cyan-600 font-bold hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
