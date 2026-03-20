import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/users/login', { email, password });
      dispatch(setCredentials(data));
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/');
    } catch (error) {
      toast.error('Invalid Email or Password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
      <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">Sign In to Enterprise</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="admin@example.com" 
            required 
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="••••••••" 
            required 
          />
        </div>
        <div className="flex justify-end mt-2">
          <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
            Forgot Password?
          </Link>
        </div>
        <button type="submit" className="w-full bg-gray-900 text-white font-bold py-2 rounded hover:bg-indigo-600 transition">
          Secure Sign In
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        New to NovaHardware?{' '}
        <Link to="/register" className="text-indigo-600 font-bold hover:underline">
          Create an Account
        </Link>
      </p>
    </div>
  );
};

export default Login;
