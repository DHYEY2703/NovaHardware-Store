import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import axios from 'axios';
import { ShoppingCart, Star, StarHalf, ArrowLeft, Heart, Share2, Copy, CheckCheck } from 'lucide-react';
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
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const { userInfo } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        setActiveImage(data.image);

        // Track recently viewed in localStorage
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const filtered = viewed.filter((v: any) => v._id !== data._id);
        const updated = [{ _id: data._id, name: data.name, image: data.image, price: data.price, rating: data.rating }, ...filtered].slice(0, 8);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));

        // Fetch related products (same category)
        const { data: relData } = await axios.get(`/api/products?category=${data.category}`);
        const related = (relData.products || relData).filter((p: any) => p._id !== data._id).slice(0, 4);
        setRelatedProducts(related);
      } catch (error) {
        toast.error('Product Not Found');
      }
    };
    fetchProduct();

    // Load recently viewed (exclude current)
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(viewed.filter((v: any) => v._id !== id).slice(0, 6));

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
    if (!userInfo) { toast.error('Log in to use Wishlist!'); return navigate('/login'); }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('/api/users/wishlist', { productId: id }, config);
      setInWishlist(data.includes(id));
      toast.success(data.includes(id) ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist 💔');
    } catch (err) { toast.error('Could not update Wishlist'); }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=Check out ${product.name} on NovaHardware! $${product.price.toFixed(2)} — ${window.location.href}`, '_blank');
  };
  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Check out ${product.name} on NovaHardware! $${product.price.toFixed(2)}&url=${window.location.href}`, '_blank');
  };
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!userInfo) return toast.error('You must be logged in to review.');
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`/api/products/${id}/reviews`, { rating, comment }, config);
      toast.success('Review posted!');
      setRating(0); setComment('');
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Review failed.');
    }
  };

  const renderStars = (r: number) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < r ? "text-yellow-400" : "text-gray-300"}>
      {r - i === 0.5 ? <StarHalf size={20} fill="currentColor" /> : <Star size={20} fill={i < r ? "currentColor" : "none"} />}
    </span>
  ));

  // Skeleton Loading
  if (!product) return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-40 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border dark:border-gray-800">
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mt-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded mt-4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded mt-4"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 font-bold transition">
        <ArrowLeft size={20} /> Back to Storefront
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border dark:border-gray-800 relative transition-colors duration-300">
        <button onClick={toggleWishlist} className="absolute top-10 right-10 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-110 transition z-10" title="Save to Wishlist">
          <Heart size={28} className={inWishlist ? "text-red-500" : "text-gray-300 dark:text-gray-500"} fill={inWishlist ? "currentColor" : "none"} />
        </button>

        <div className="flex flex-col gap-4">
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-md border dark:border-gray-700 bg-gray-100 dark:bg-gray-800 relative group">
            <img src={activeImage || product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div onClick={() => setActiveImage(product.image)} className={`w-20 h-20 rounded-lg shrink-0 cursor-pointer overflow-hidden border-2 transition-all ${activeImage === product.image ? 'border-cyan-500 shadow-md scale-105' : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'}`}>
              <img src={product.image} alt="Main" className="w-full h-full object-cover bg-white dark:bg-gray-800" />
            </div>
            {product.images && product.images.map((img: string, idx: number) => (
              <div key={idx} onClick={() => setActiveImage(img)} className={`w-20 h-20 rounded-lg shrink-0 cursor-pointer overflow-hidden border-2 transition-all ${activeImage === img ? 'border-cyan-500 shadow-md scale-105' : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'}`}>
                <img src={img} alt={`Thumb ${idx+1}`} className="w-full h-full object-cover bg-white dark:bg-gray-800" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            {renderStars(product.rating)}
            <span className="text-gray-500 dark:text-gray-400 font-medium">{product.numReviews} Reviews</span>
          </div>
          <h2 className="text-4xl text-gray-900 dark:text-white font-black mb-4 border-b dark:border-gray-700 pb-4">${product.price.toFixed(2)}</h2>

          {/* Share Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-gray-500 dark:text-gray-400 font-bold text-sm flex items-center gap-1"><Share2 size={16}/> Share:</span>
            <button onClick={shareWhatsApp} className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800 transition" title="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
            <button onClick={shareTwitter} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition" title="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </button>
            <button onClick={copyLink} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition" title="Copy Link">
              {copied ? <CheckCheck size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-500" />}
            </button>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded border dark:border-gray-700">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <span className={`font-bold pb-1 border-b-2 ${product.countInStock > 0 ? 'text-green-600 border-green-600' : 'text-red-500 border-red-500'}`}>
              {product.countInStock > 0
                ? product.countInStock <= 5 ? `🔥 Only ${product.countInStock} left — order soon!` : `In Stock (${product.countInStock} available)`
                : 'Out of Stock'}
            </span>
          </div>

          {product.countInStock > 0 && (
            <div className="flex gap-4 items-center">
              <select title="Qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white p-3 rounded font-bold outline-none focus:border-cyan-500 transition-colors">
                {[...Array(product.countInStock).keys()].map((x) => (<option key={x+1} value={x+1}>{x+1}</option>))}
              </select>
              <button onClick={handleAddToCart} className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-extrabold py-3 rounded shadow-md transition flex justify-center items-center gap-2 text-lg">
                <ShoppingCart size={24} /> ADD TO CART
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">You Might Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rp: any) => (
              <Link key={rp._id} to={`/product/${rp._id}`} className="bg-white dark:bg-gray-900 rounded-lg shadow border dark:border-gray-800 hover:shadow-cyan-500/20 hover:shadow-xl transition duration-300 overflow-hidden group">
                <img src={rp.image} alt={rp.name} className="w-full h-36 object-cover bg-gray-100 dark:bg-gray-800 group-hover:scale-105 transition-transform duration-300" />
                <div className="p-3">
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{rp.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }, (_, i) => (<Star key={i} size={12} fill={i < rp.rating ? "currentColor" : "none"} className={i < rp.rating ? "text-yellow-400" : "text-gray-300"} />))}
                  </div>
                  <p className="font-black text-lg text-gray-900 dark:text-white mt-1">${rp.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Recently Viewed</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {recentlyViewed.map((rv: any) => (
              <Link key={rv._id} to={`/product/${rv._id}`} className="min-w-[160px] bg-white dark:bg-gray-900 rounded-lg shadow border dark:border-gray-800 hover:shadow-lg transition duration-300 overflow-hidden shrink-0">
                <img src={rv.image} alt={rv.name} className="w-full h-28 object-cover bg-gray-100 dark:bg-gray-800" />
                <div className="p-2">
                  <h4 className="font-bold text-xs text-gray-800 dark:text-gray-300 line-clamp-1">{rv.name}</h4>
                  <p className="font-black text-sm text-gray-900 dark:text-white">${rv.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-12 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border dark:border-gray-800 mb-20 whitespace-normal transition-colors duration-300">
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-4 mb-6">Verified Customer Reviews</h3>
        {product.reviews.length === 0 && <p className="text-gray-600 dark:text-gray-400 italic">No reviews yet. Be the first!</p>}
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
            <h4 className="font-bold text-xl dark:text-white mb-4">Write a Review</h4>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Rating</label>
              <select title="Rating" value={rating} onChange={(e) => setRating(Number(e.target.value))} required className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="">Select Rating...</option>
                <option value="1">1 - Terrible</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Comment</label>
              <textarea placeholder="Your experience..." required value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-3 rounded h-24 whitespace-normal focus:ring-2 focus:ring-cyan-500 outline-none"></textarea>
            </div>
            <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-cyan-700 transition">Submit Review</button>
          </form>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-4 rounded font-bold">
            Please <Link to="/login" className="underline font-black">Sign In</Link> to write a review.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
