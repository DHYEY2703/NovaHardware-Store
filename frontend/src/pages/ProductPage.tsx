import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';

import axios from 'axios';
import { ShoppingCart, Star, StarHalf, ArrowLeft, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [inWishlist, setInWishlist] = useState(false);
  
  const { userInfo } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        setActiveImage(data.image); // Set default image
      } catch (error) {
        toast.error('Product Not Found');
      }
    };
    fetchProduct();

    if (userInfo && userInfo.wishlist) {
      setInWishlist(userInfo.wishlist.includes(id));
    }
  }, [id, userInfo]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty }));
    toast.success(`${product.name} added to cart!`);
    navigate('/cart');
  };

  const toggleWishlist = async () => {
    if (!userInfo) {
      toast.error('You must log in to use the Cloud Wishlist!');
      return navigate('/login');
    }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('/api/users/wishlist', { productId: id }, config);
      setInWishlist(data.includes(id));
      toast.success(data.includes(id) ? 'Saved to Cloud Wishlist ❤️' : 'Removed from Wishlist 💔');
      // Update local storage so Redux state is kind of fresh (ideally dispatch update credentials, but this works purely visually for now)
    } catch (err) {
      toast.error('Could not update Wishlist');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!userInfo) return toast.error('You must be logged in to review.');
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`/api/products/${id}/reviews`, { rating, comment }, config);
      toast.success('Review successfully posted!');
      setRating(0);
      setComment('');
      // Refresh product
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'You already reviewed this item, or network error.');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        {rating - i === 0.5 ? <StarHalf size={20} fill="currentColor" /> : <Star size={20} fill={i < rating ? "currentColor" : "none"} />}
      </span>
    ));
  };

  if (!product) return <div className="text-center mt-20 text-xl animate-pulse text-cyan-600 font-bold">Loading Tech Specs...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 font-bold transition">
        <ArrowLeft size={20} /> Back to Storefront
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border dark:border-gray-800 relative transition-colors duration-300">
        <button 
          onClick={toggleWishlist}
          className="absolute top-10 right-10 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-110 transition z-10"
          title="Save to Wishlist"
        >
          <Heart size={28} className={inWishlist ? "text-red-500" : "text-gray-300 dark:text-gray-500"} fill={inWishlist ? "currentColor" : "none"} />
        </button>

        <div className="flex flex-col gap-4">
          {/* Main Hero Image */}
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-md border dark:border-gray-700 bg-gray-100 dark:bg-gray-800 relative group">
            <img 
              src={activeImage || product.image} 
              alt={product.name} 
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
            />
          </div>
          
          {/* Thumbnail Gallery (Feature 6) */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Always show main image as first thumbnail */}
            <div 
              onClick={() => setActiveImage(product.image)}
              className={`w-20 h-20 rounded-lg shrink-0 cursor-pointer overflow-hidden border-2 transition-all ${activeImage === product.image ? 'border-cyan-500 shadow-md transform scale-105' : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'}`}
            >
              <img src={product.image} alt="Thumbnail Main" className="w-full h-full object-cover bg-white dark:bg-gray-800" />
            </div>
            
            {/* Map over additional images if they exist */}
            {product.images && product.images.map((img: string, idx: number) => (
              <div 
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-lg shrink-0 cursor-pointer overflow-hidden border-2 transition-all ${activeImage === img ? 'border-cyan-500 shadow-md transform scale-105' : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover bg-white dark:bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            {renderStars(product.rating)}
            <span className="text-gray-500 dark:text-gray-400 font-medium">{product.numReviews} Global Reviews</span>
          </div>
          <h2 className="text-4xl text-gray-900 dark:text-white font-black mb-6 border-b dark:border-gray-700 pb-4">${product.price.toFixed(2)}</h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded border dark:border-gray-700">{product.description}</p>
          
          <div className="flex items-center gap-4 mb-6">
            <span className={`font-bold pb-1 border-b-2 ${product.countInStock > 0 ? 'text-green-600 border-green-600' : 'text-red-500 border-red-500'}`}>
              {product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : 'Out of Stock'}
            </span>
          </div>

          {product.countInStock > 0 && (
            <div className="flex gap-4 items-center">
              <select 
                title="Select Quantity"
                value={qty} 
                onChange={(e) => setQty(Number(e.target.value))} 
                className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white p-3 rounded font-bold outline-none focus:border-cyan-500 transition-colors"
              >
                {[...Array(product.countInStock).keys()].map((x) => (
                  <option key={x + 1} value={x + 1}>{x + 1}</option>
                ))}
              </select>
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-extrabold py-3 rounded shadow-md transition flex justify-center items-center gap-2 text-lg"
              >
                <ShoppingCart size={24} /> ADD TO CART
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border dark:border-gray-800 mb-20 whitespace-normal transition-colors duration-300">
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-4 mb-6">Verified Customer Reviews</h3>
        {product.reviews.length === 0 && <p className="text-gray-600 dark:text-gray-400 italic">No reviews yet. Be the first to review!</p>}
        <div className="space-y-6 mb-8">
          {product.reviews.map((review: any) => (
            <div key={review._id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded border dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800 dark:text-gray-200">{review.name}</span>
                <span className="flex">{renderStars(review.rating)}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
            </div>
          ))}
        </div>

        {userInfo ? (
          <form onSubmit={submitReview} className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg border dark:border-gray-700 shadow-inner">
            <h4 className="font-bold text-xl dark:text-white mb-4">Write a Product Review</h4>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Rating</label>
              <select title="Rating Select" value={rating} onChange={(e) => setRating(Number(e.target.value))} required className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="">Select an authentic 5-Star Rating...</option>
                <option value="1">1 - Terrible</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent (Highly Recommend)</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Review Description</label>
              <textarea placeholder="Describe your experience with this tech hardware..." required value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-3 rounded h-24 whitespace-normal focus:ring-2 focus:ring-cyan-500 outline-none"></textarea>
            </div>
            <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-cyan-700 transition">Submit Authentic Review</button>
          </form>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-4 rounded font-bold">
            Please <Link to="/login" className="underline font-black hover:text-blue-900 dark:hover:text-cyan-400">Sign In</Link> to write an authentic review.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
