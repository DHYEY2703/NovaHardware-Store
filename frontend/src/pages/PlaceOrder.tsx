import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { clearCart } from '../store/cartSlice';
import { CreditCard, CheckCircle, Package, Banknote } from 'lucide-react';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const cart = useSelector((state: any) => state.cart);
  const { userInfo } = useSelector((state: any) => state.auth);

  const shippingAddress = location.state?.shippingAddress || { address: 'Not provided', city: 'SJ', postalCode: '00', country: 'US' };
  const paymentMethod = location.state?.paymentMethod || 'Cash On Delivery';

  useEffect(() => {
    if (!userInfo) {
      toast.error('You must be logged in to securely place an order.');
      navigate('/login');
    } else if (cart.cartItems.length === 0) {
      toast.error('Your cart cannot be empty during checkout.');
      navigate('/cart');
    }
    // Only check cart on initial load, do not watch cart state actively during checkout to prevent premature bouncing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotalPrice = cart.cartItems.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);
  const itemsPrice = userInfo?.isPrime ? subtotalPrice * 0.9 : subtotalPrice;
  const shippingPrice = userInfo?.isPrime ? 0 : (itemsPrice > 1000 ? 0 : 25); 
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2)); // 15% Tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCreateOrderDB = async () => {
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axios.post('/api/orders', {
      orderItems: cart.cartItems,
      shippingAddress,
      paymentMethod,
      itemsPrice, taxPrice, shippingPrice, totalPrice,
    }, config);
    dispatch(clearCart());
    return { orderId: data._id, config };
  };

  const payViaRazorpay = async () => {
    const res = await loadRazorpayScript();
    if (!res) return toast.error('Razorpay SDK failed to load. Check connection.');

    toast.loading('Initializing Secure Indian Razorpay Link...', { id: 'rzp' });
    try {
      const { orderId, config } = await handleCreateOrderDB();
      const { data: rzpOrder } = await axios.post(`/api/orders/${orderId}/create-razorpay-order`, {}, config);

      const { data: keyData } = await axios.get('/api/config/razorpay');

      const options = {
        key: keyData, 
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'NovaHardware MERN',
        description: 'Developer Prototype Transaction',
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          toast.success(`Payment verified ID: ${response.razorpay_payment_id}`);
          await axios.put(`/api/orders/${orderId}/pay`, { id: response.razorpay_payment_id, status: 'succeeded', update_time: new Date().toISOString(), payer: { email_address: userInfo.email } }, config);
          navigate('/');
        },
        prefill: { name: userInfo.name, email: userInfo.email, contact: '9999999999' },
        theme: { color: '#06b6d4' },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      toast.dismiss('rzp');
    } catch (err: any) {
      toast.error('Razorpay Generation Failed: Check backend API');
      toast.dismiss('rzp');
    }
  };

  const payViaMockCOD = async () => {
    const tId = toast.loading('Processing Cash On Delivery Invoice 🤖...');
    try {
      const { orderId, config } = await handleCreateOrderDB();
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Hit real backend simulation mapping
      await axios.put(`/api/orders/${orderId}/pay`, {
        id: `COD_TX_${Math.floor(Math.random() * 99999)}`, 
        status: 'succeeded', 
        update_time: new Date().toISOString(), 
        payer: { email_address: userInfo.email } 
      }, config);

      toast.success('Your order was successfully placed via Cash on Delivery!', { id: tId });
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'System Delivery Crashed', { id: tId });
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border-l-4 border-cyan-500 dark:border-cyan-400 transition-colors">
          <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-2 dark:text-white"><Package/> Shipping</h2>
          <p className="text-gray-700 dark:text-gray-300 font-medium"><strong>Address:</strong> {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.country}, {shippingAddress.postalCode}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border-l-4 border-cyan-500 dark:border-cyan-400 transition-colors">
          <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-2 dark:text-white"><CreditCard/> Payment Method</h2>
          <p className="text-gray-700 dark:text-gray-300 font-medium"><strong>Method Chosen:</strong> <span className="text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-0.5 rounded">{paymentMethod}</span></p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow border-l-4 border-cyan-500 dark:border-cyan-400 transition-colors">
          <h2 className="text-2xl font-extrabold mb-4 dark:text-white">Hardware Items</h2>
          {cart.cartItems.map((item: any) => (
            <div key={item._id} className="flex items-center gap-4 mb-4 border-b dark:border-gray-800 pb-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded bg-gray-100 dark:bg-gray-800" />
              <Link to={`/product/${item._id}`} className="font-bold flex-1 text-cyan-700 dark:text-cyan-400 hover:underline">{item.name}</Link>
              <span className="font-bold text-gray-700 dark:text-gray-300">{item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 text-white p-8 rounded-lg shadow-xl h-fit sticky top-24">
        <h2 className="text-2xl font-extrabold mb-6 border-b border-gray-700 pb-4">Secure Checkout</h2>
        
        {userInfo?.isPrime && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg mb-6 shadow-lg border border-indigo-400">
            <h3 className="font-black flex items-center gap-1">👑 PRIME APPLIED</h3>
            <p className="text-sm font-medium">10% Off Items + Free Global Shipping</p>
          </div>
        )}

        <div className="space-y-3 font-medium text-lg">
          <div className="flex justify-between"><span>Items Subtotal:</span> <span>${itemsPrice.toFixed(2)}</span></div>
          <div className="flex justify-between text-green-400"><span>Shipping:</span> <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span></div>
          <div className="flex justify-between border-b border-gray-700 pb-4"><span>Tax (15%):</span> <span>${taxPrice.toFixed(2)}</span></div>
          <div className="flex justify-between font-black text-2xl text-cyan-400 pt-2"><span>Total:</span> <span>${totalPrice.toFixed(2)}</span></div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          {paymentMethod === 'Razorpay' ? (
            <button 
              onClick={payViaRazorpay}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 font-extrabold py-3.5 rounded-md flex items-center justify-center gap-2 transition shadow-lg"
            >
              <CheckCircle size={22}/> PAY VIA RAZORPAY (INR)
            </button>
          ) : (
            <button 
              onClick={payViaMockCOD}
              className="w-full bg-green-500 text-gray-900 hover:bg-green-400 font-extrabold py-3.5 rounded-md flex items-center justify-center gap-2 transition shadow-lg"
            >
              <Banknote size={22}/> FINALIZE CASH ON DELIVERY
            </button>
          )}
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-6">
          {paymentMethod === 'Razorpay' ? "Razorpay UPI & 3D-Secure 256-Bit Supported" : "You will pay with exact cash to the delivery agent."}
        </p>
      </div>
    </div>
  );
};

export default PlaceOrder;
