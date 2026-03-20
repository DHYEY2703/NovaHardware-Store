import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { ShoppingCart, Star, StarHalf, SlidersHorizontal, X, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, Link, useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  countInStock: number;
  rating: number;
  numReviews: number;
  category: string;
}

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 animate-pulse">
    <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
    </div>
  </div>
);

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();

  // Filters
  const [priceRange, setPriceRange] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);

  const { userInfo } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/products${search}`);
        let fetched = data.products || data;

        // Apply client-side filters
        if (priceRange) {
          const [min, max] = priceRange.split('-').map(Number);
          fetched = fetched.filter((p: Product) => max ? p.price >= min && p.price <= max : p.price >= min);
        }
        if (minRating > 0) {
          fetched = fetched.filter((p: Product) => p.rating >= minRating);
        }

        setProducts(fetched);
        setPage(data.page || 1);
        setPages(data.pages || 1);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, priceRange, minRating]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const clearFilters = () => {
    setPriceRange('');
    setMinRating(0);
  };

  const [compareCount, setCompareCount] = useState(0);
  useEffect(() => {
    setCompareCount(JSON.parse(localStorage.getItem('compareItems') || '[]').length);
  }, []);

  const addToCompare = (product: Product) => {
    const items = JSON.parse(localStorage.getItem('compareItems') || '[]');
    if (items.find((i: any) => i._id === product._id)) {
      toast('Already in compare list', { icon: '⚖️' });
      return;
    }
    if (items.length >= 4) {
      toast.error('Max 4 items for comparison!');
      return;
    }
    items.push(product);
    localStorage.setItem('compareItems', JSON.stringify(items));
    setCompareCount(items.length);
    toast.success(`${product.name} added to compare!`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        {rating - i === 0.5 ? <StarHalf size={16} fill="currentColor" /> : <Star size={16} fill={i < rating ? "currentColor" : "none"} />}
      </span>
    ));
  };

  const activeFilters = priceRange || minRating > 0;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Category Sidebar */}
      <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md dark:shadow-gray-800 h-fit border dark:border-gray-800 transition-colors">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 border-b dark:border-gray-700 pb-2">Categories</h2>
        <ul className="space-y-3 font-medium text-gray-600 dark:text-gray-400">
          <li><Link to="/" className="hover:text-cyan-600 transition">All Products</Link></li>
          <li><Link to="/?category=Hardware" className="hover:text-cyan-600 transition">PC Components</Link></li>
          <li><Link to="/?category=Electronics" className="hover:text-cyan-600 transition">Laptops & PCs</Link></li>
          <li><Link to="/?category=Accessories" className="hover:text-cyan-600 transition">Peripherals</Link></li>
        </ul>

        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mt-8 mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2">
          <SlidersHorizontal size={18}/> Filter by Price
        </h2>
        <div className="space-y-2 text-gray-700 dark:text-gray-400">
          {[
            { label: 'Under $50', value: '0-50' },
            { label: '$50 to $200', value: '50-200' },
            { label: '$200 to $1000', value: '200-1000' },
            { label: 'Over $1000', value: '1000-999999' },
          ].map((filter) => (
            <label key={filter.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={priceRange === filter.value}
                onChange={() => setPriceRange(filter.value)}
                className="w-4 h-4 text-cyan-600"
              />
              {filter.label}
            </label>
          ))}
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mt-8 mb-4 border-b dark:border-gray-700 pb-2">Filter by Rating</h2>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((star) => (
            <label key={star} className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-400">
              <input
                type="radio"
                name="minRating"
                checked={minRating === star}
                onChange={() => setMinRating(star)}
                className="w-4 h-4 text-cyan-600"
              />
              <span className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={i < star ? "currentColor" : "none"} className={i < star ? "text-yellow-400" : "text-gray-300"} />)}</span>
              <span className="text-sm">& Up</span>
            </label>
          ))}
        </div>

        {activeFilters && (
          <button onClick={clearFilters} className="mt-6 w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition">
            <X size={16}/> Clear All Filters
          </button>
        )}
      </aside>

      {/* Main Content Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-cyan-700 dark:from-cyan-400 dark:to-white">Explosive Hardware Deals</h1>
          {activeFilters && (
            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800">
              {products.length} result{products.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-xl text-gray-600 dark:text-gray-400 font-bold bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border dark:border-gray-800">
            No products found matching your filters.
            {activeFilters && <button onClick={clearFilters} className="block mt-3 text-cyan-600 hover:underline text-base">Clear all filters</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 hover:shadow-cyan-500/20 hover:shadow-2xl transition duration-300 flex flex-col">
                <Link to={`/product/${product._id}`} className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-t-lg bg-gray-100" />
                  {product.countInStock > 0 && product.countInStock <= 5 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Only {product.countInStock} left!</span>
                  )}
                  {product.countInStock === 0 && (
                    <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
                  )}
                </Link>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${product._id}`}>
                      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 hover:text-cyan-600 line-clamp-2" title={product.name}>{product.name}</h2>
                    </Link>
                    <div className="flex items-center gap-1 mt-1 mb-2">
                      {renderStars(product.rating)}
                      <span className="text-sm text-cyan-600 hover:underline cursor-pointer ml-1">{product.numReviews} ratings</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-black text-2xl">${product.price.toFixed(2)}</h3>
                    <p className="text-sm text-green-600 font-bold mt-1">✓ Prime Delivery Tomorrow</p>
                    
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.countInStock === 0}
                      className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-full font-bold shadow-sm transition ${
                        product.countInStock > 0 
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart size={18} />
                      {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={() => addToCompare(product)}
                      className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 rounded-full font-bold text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-500 hover:text-cyan-600 transition"
                    >
                      <BarChart3 size={14} /> Compare
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center mt-12 mb-6">
            <div className="flex space-x-2 bg-white dark:bg-gray-900 p-2 border dark:border-gray-800 shadow-sm rounded-lg">
              {[...Array(pages).keys()].map((x) => {
                const keywordSearch = search ? search.split('&pageNumber')[0] : '';
                return (
                  <Link
                    key={x + 1}
                    to={`${keywordSearch ? keywordSearch + '&' : '?'}pageNumber=${x + 1}`}
                    className={`px-4 py-2 font-bold rounded-md transition ${x + 1 === page ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-800'}`}
                  >
                    {x + 1}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Compare Bar */}
      {compareCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 border border-gray-700 animate-bounce-once">
          <BarChart3 size={20} className="text-cyan-400" />
          <span className="font-bold">{compareCount} item{compareCount > 1 ? 's' : ''} selected</span>
          <Link to="/compare" className="bg-cyan-600 hover:bg-cyan-700 px-4 py-1.5 rounded-full font-bold text-sm transition">Compare Now</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
