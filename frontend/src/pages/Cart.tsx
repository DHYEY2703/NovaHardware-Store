import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQty } from '../store/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, CreditCard, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems } = useSelector((state: any) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = (id: string, name: string) => {
    dispatch(removeFromCart(id));
    toast.error(`${name} removed from cart`);
  };

  const handleQtyChange = (id: string, qty: number, stock: number) => {
    if (qty < 1 || qty > stock) return;
    dispatch(updateQty({ id, qty }));
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
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleQtyChange(item._id, item.qty - 1, item.countInStock)}
                      disabled={item.qty <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 border dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-extrabold text-lg text-gray-900 dark:text-white">{item.qty}</span>
                    <button
                      onClick={() => handleQtyChange(item._id, item.qty + 1, item.countInStock)}
                      disabled={item.qty >= item.countInStock}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 border dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-black text-gray-900 dark:text-white text-lg">${(item.price * item.qty).toFixed(2)}</span>
                  <button onClick={() => handleRemove(item._id, item.name)} className="text-red-500 hover:text-red-600 p-2">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border dark:border-gray-800 h-fit transition-colors">
            <h2 className="text-xl font-bold dark:text-white border-b dark:border-gray-800 pb-4 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Items ({cartItems.reduce((acc: number, item: any) => acc + item.qty, 0)})</span>
                <span className="font-bold dark:text-gray-300">${cartItems.reduce((acc: number, item: any) => acc + item.qty * item.price, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="font-bold text-green-600">{cartItems.reduce((acc: number, item: any) => acc + item.qty * item.price, 0) > 100 ? 'FREE' : '$10.00'}</span>
              </div>
              <div className="border-t dark:border-gray-800 pt-3 flex justify-between text-lg">
                <span className="font-extrabold dark:text-white">Total</span>
                <span className="font-black dark:text-white">
                  ${(cartItems.reduce((acc: number, item: any) => acc + item.qty * item.price, 0) + (cartItems.reduce((acc: number, item: any) => acc + item.qty * item.price, 0) > 100 ? 0 : 10)).toFixed(2)}
                </span>
              </div>
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
