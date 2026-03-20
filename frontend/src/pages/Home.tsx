import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { ShoppingCart, Star, StarHalf } from 'lucide-react';
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
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();

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
        setProducts(data.products || data);
        setPage(data.page || 1);
        setPages(data.pages || 1);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        {rating - i === 0.5 ? <StarHalf size={16} fill="currentColor" /> : <Star size={16} fill={i < rating ? "currentColor" : "none"} />}
      </span>
    ));
  };

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

        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mt-8 mb-4 border-b dark:border-gray-700 pb-2">Filter by Price</h2>
        <div className="space-y-2 text-gray-700 dark:text-gray-400">
          <label className="flex items-center gap-2"><input type="checkbox" /> Under $50</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> $50 to $200</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> $200 to $1000</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> Over $1000</label>
        </div>
      </aside>

      {/* Main Content Grid */}
      <div className="flex-1">
        <h1 className="text-3xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-cyan-700 dark:from-cyan-400 dark:to-white">Explosive Hardware Deals</h1>
        
        {loading ? (
          <div className="text-center mt-20 text-xl font-semibold animate-pulse text-cyan-600">Loading enterprise catalog...</div>
        ) : products.length === 0 ? (
          <div className="text-xl text-gray-600 font-bold bg-white p-8 rounded-lg shadow-md">No products found matching your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 hover:shadow-cyan-500/20 hover:shadow-2xl transition duration-300 flex flex-col">
                <Link to={`/product/${product._id}`}>
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-t-lg bg-gray-100" />
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Pagination Engine */}
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
    </div>
  );
};

export default Home;
