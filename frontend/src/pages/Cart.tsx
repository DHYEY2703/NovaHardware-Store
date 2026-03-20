import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../store/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems } = useSelector((state: any) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = (id: string, name: string) => {
    dispatch(removeFromCart(id));
    toast.error(`${name} removed from cart`);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return toast.error('Your cart is completely empty!');
    navigate('/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 border-b dark:border-gray-800 pb-4">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border dark:border-gray-800 text-center transition-colors">
          <p className="text-gray-600 dark:text-gray-400 text-lg">Your cart is empty.</p>
          <Link to="/" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline mt-4 inline-block">Go Back to Store</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item: any) => (
              <div key={item._id} className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border dark:border-gray-800 flex items-center gap-4 transition-colors">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md bg-gray-100 dark:bg-gray-800" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{item.name}</h3>
                  <p className="text-cyan-700 dark:text-cyan-400 font-black">${item.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-1">Quantity: {item.qty}</p>
                </div>
                <button onClick={() => handleRemove(item._id, item.name)} className="text-red-500 hover:text-red-600 p-2">
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border dark:border-gray-800 h-fit transition-colors">
            <h2 className="text-xl font-bold dark:text-white border-b dark:border-gray-800 pb-4 mb-4">Order Summary</h2>
            <div className="flex justify-between mb-6 text-lg">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Items ({cartItems.reduce((acc: number, item: any) => acc + item.qty, 0)}):</span>
              <span className="font-black dark:text-white">${cartItems.reduce((acc: number, item: any) => acc + item.qty * item.price, 0).toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout} 
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded shadow flex items-center justify-center gap-2 transition"
            >
              <CreditCard size={20} /> Checkout Securely
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
