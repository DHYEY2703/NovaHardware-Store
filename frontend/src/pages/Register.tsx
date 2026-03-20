import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      const { data } = await axios.post('/api/users/register', { name, email, password });
      toast.success(data.message || 'OTP Sent to Email. Please Verify.');
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register account');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border-t-4 border-cyan-500">
      <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">Create New Account</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none" 
            placeholder="John Doe" 
            required 
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none" 
            placeholder="johndoe@example.com" 
            required 
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none" 
            placeholder="••••••••" 
            required 
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none" 
            placeholder="••••••••" 
            required 
          />
        </div>
        <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-2.5 rounded hover:bg-cyan-700 transition">
          Secure Sign Up
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-cyan-600 font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Register;
