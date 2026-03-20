import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2, ArrowLeft, BarChart3 } from 'lucide-react';

const Compare = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('compareItems') || '[]');
    setItems(stored);
  }, []);

  const removeItem = (id: string) => {
    const updated = items.filter((item) => item._id !== id);
    localStorage.setItem('compareItems', JSON.stringify(updated));
    setItems(updated);
  };

  const clearAll = () => {
    localStorage.removeItem('compareItems');
    setItems([]);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <BarChart3 size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-4">Product Comparison</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">No products selected for comparison.</p>
        <Link to="/" className="bg-cyan-600 text-white font-bold px-6 py-3 rounded shadow hover:bg-cyan-700 transition">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 mb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="hover:text-cyan-600 dark:text-gray-300 transition"><ArrowLeft size={20} /></Link>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2"><BarChart3 className="text-cyan-600" /> Compare Products</h1>
        </div>
        <button onClick={clearAll} className="text-red-500 hover:text-red-600 font-bold text-sm flex items-center gap-1 transition"><Trash2 size={16}/> Clear All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border dark:border-gray-800 overflow-hidden">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="p-4 text-left text-gray-600 dark:text-gray-400 font-bold text-sm uppercase w-36">Feature</th>
              {items.map((item) => (
                <th key={item._id} className="p-4 text-center min-w-[200px]">
                  <button onClick={() => removeItem(item._id)} className="float-right text-red-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                  <Link to={`/product/${item._id}`}>
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg mx-auto mb-2 bg-gray-100 dark:bg-gray-800 shadow" />
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm hover:text-cyan-600 transition line-clamp-2">{item.name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
              <td className="p-4 font-bold text-gray-600 dark:text-gray-400 text-sm">Price</td>
              {items.map((item) => (
                <td key={item._id} className="p-4 text-center font-black text-xl text-gray-900 dark:text-white">${item.price.toFixed(2)}</td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
              <td className="p-4 font-bold text-gray-600 dark:text-gray-400 text-sm">Rating</td>
              {items.map((item) => (
                <td key={item._id} className="p-4 text-center">
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={16} fill={i < (item.rating || 0) ? "currentColor" : "none"} className={i < (item.rating || 0) ? "text-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">{item.numReviews || 0} reviews</span>
                </td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
              <td className="p-4 font-bold text-gray-600 dark:text-gray-400 text-sm">Category</td>
              {items.map((item) => (
                <td key={item._id} className="p-4 text-center">
                  <span className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 px-3 py-1 rounded-full text-sm font-bold">{item.category || 'N/A'}</span>
                </td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
              <td className="p-4 font-bold text-gray-600 dark:text-gray-400 text-sm">Availability</td>
              {items.map((item) => (
                <td key={item._id} className="p-4 text-center">
                  <span className={`font-bold text-sm ${item.countInStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {item.countInStock > 0 ? `✓ ${item.countInStock} in stock` : '✗ Out of Stock'}
                  </span>
                </td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
              <td className="p-4 font-bold text-gray-600 dark:text-gray-400 text-sm">Description</td>
              {items.map((item) => (
                <td key={item._id} className="p-4 text-center text-sm text-gray-600 dark:text-gray-400 max-w-[250px]">
                  <p className="line-clamp-4">{item.description || 'No description available'}</p>
                </td>
              ))}
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
              <td className="p-4 font-bold text-gray-600 dark:text-gray-400 text-sm">Action</td>
              {items.map((item) => (
                <td key={item._id} className="p-4 text-center">
                  <Link to={`/product/${item._id}`} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-full shadow text-sm transition">
                    View Product
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compare;
