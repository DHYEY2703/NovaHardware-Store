import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

import toast from 'react-hot-toast';
import { Box, Package } from 'lucide-react';

const Admin = () => {
  const { userInfo } = useSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState('inventory');
  
  // Product Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      if (activeTab === 'orders') {
        const fetchOrders = async () => {
          try {
            setLoadingOrders(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/orders', config);
            setOrders(data);
            setLoadingOrders(false);
          } catch (err) {
            toast.error('Failed to load store orders');
            setLoadingOrders(false);
          }
        };
        fetchOrders();
      } else if (activeTab === 'inventory') {
        const fetchProducts = async () => {
          try {
            setLoadingProducts(true);
            const { data } = await axios.get('/api/products');
            setProducts(data.products || data);
            setLoadingProducts(false);
          } catch (err) {
            toast.error('Failed to load inventory');
            setLoadingProducts(false);
          }
        };
        fetchProducts();
      }
    }
  }, [userInfo, activeTab]);

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      await axios.post('/api/products', { name, price: Number(price), description, image, category, countInStock: Number(countInStock) }, config);
      toast.success('Product officially listed on store!');
      setName(''); setPrice(''); setDescription(''); setImage(''); setCategory(''); setCountInStock('');
      
      // Refresh strictly inventory
      const { data } = await axios.get('/api/products');
      setProducts(data.products || data);
    } catch (err) {
      toast.error('Failed to upload product. Check Admin Permissions.');
    }
  };

  const deleteProductHandler = async (id: string) => {
    if (window.confirm('Are you absolutely sure you want to delete this product?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/products/${id}`, config);
        toast.success('Product permanently deleted');
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  const statusHandler = async (id: string, newStatus: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${id}/status`, { status: newStatus }, config);
      toast.success(`Order officially marked as ${newStatus}!`);
      setOrders(orders.map((o: any) => o._id === id ? { ...o, status: newStatus, isDelivered: newStatus === 'Delivered' } : o));
    } catch (err) {
      toast.error('Failed to update order status pipeline');
    }
  };

  const returnActionHandler = async (id: string, action: string) => {
    if (window.confirm(`Are you sure you want to ${action} this return request?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.put(`/api/orders/${id}/return-action`, { action }, config);
        toast.success(`Return request ${action}`);
        setOrders(orders.map((o: any) => o._id === id ? { ...o, returnStatus: action } : o));
      } catch (err) {
        toast.error(`Failed to ${action.toLowerCase()} return request`);
      }
    }
  };

  if (!userInfo || !userInfo.isAdmin) {
    return <div className="text-center font-bold text-red-500 mt-20 text-2xl">Access Denied. Admins Only.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="flex items-center gap-2 mb-6 border-b dark:border-gray-800 pb-4">
        <Box size={32} className="text-indigo-600 dark:text-cyan-400" />
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Admin Store Dashboard</h1>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-2 rounded-full font-bold transition shadow ${activeTab === 'inventory' ? 'bg-indigo-600 dark:bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
        >
          Manage Inventory
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-full font-bold transition shadow ${activeTab === 'orders' ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
        >
          Fulfill Orders ({orders.length})
        </button>
      </div>
      
      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-lg shadow border-t-4 border-indigo-600 dark:border-cyan-600 h-fit transition-colors">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Product</h2>
            <form onSubmit={submitProduct} className="flex flex-col gap-3">
              <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required className="border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none" />
              <input type="number" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} required className="border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none" />
              <input type="text" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} required className="border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none" />
              <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required className="border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none" />
              <input type="number" placeholder="Stock Count" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required className="border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-2 rounded focus:ring-2 focus:ring-cyan-500 outline-none" />
              <textarea placeholder="Product Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="border dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-2 rounded h-24 focus:ring-2 focus:ring-cyan-500 outline-none" />
              <button type="submit" className="bg-indigo-600 dark:bg-cyan-600 text-white font-bold py-2 rounded hover:bg-indigo-700 dark:hover:bg-cyan-700 transition">List Product</button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow border-t-4 border-gray-800 dark:border-gray-500 transition-colors">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Global Inventory Control</h2>
            {loadingProducts ? <p className="animate-pulse dark:text-gray-400">Loading database...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-sm">
                      <th className="p-3 font-black">ID</th>
                      <th className="p-3 font-black">NAME</th>
                      <th className="p-3 font-black">PRICE</th>
                      <th className="p-3 font-black">STOCK</th>
                      <th className="p-3 font-black">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 dark:text-gray-300">
                    {products.map((product: any) => (
                      <tr key={product._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="p-3 font-mono text-xs text-gray-400">{product._id.substring(0, 8)}...</td>
                        <td className="p-3 font-bold dark:text-gray-100">{product.name}</td>
                        <td className="p-3 font-bold text-green-700 dark:text-cyan-400">${product.price.toFixed(2)}</td>
                        <td className="p-3 font-medium">{product.countInStock}</td>
                        <td className="p-3">
                          <button 
                            onClick={() => deleteProductHandler(product._id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1 rounded shadow transition text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow border-l-4 border-cyan-600 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><Package className="text-cyan-600" /> Live Customer Orders</h2>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = `/api/orders/export/csv`;
                link.setAttribute('download', 'NovaHardware_Orders_Report.csv');
                // We need auth header, so use fetch
                fetch('/api/orders/export/csv', { headers: { Authorization: `Bearer ${userInfo.token}` } })
                  .then(res => res.blob())
                  .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'NovaHardware_Orders_Report.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toast.success('Orders exported to CSV!');
                  })
                  .catch(() => toast.error('Export failed'));
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow transition text-sm"
            >
              📥 Export CSV
            </button>
          </div>
          {loadingOrders ? <p className="animate-pulse dark:text-gray-400">Loading backend pipeline...</p> : (
            orders.length === 0 ? <p className="text-gray-500 font-bold dark:text-gray-400">No orders placed yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-sm">
                    <th className="p-3 font-black">ORDER ID</th>
                    <th className="p-3 font-black">CUSTOMER</th>
                    <th className="p-3 font-black">STATUS</th>
                    <th className="p-3 font-black">ACTION</th>
                    <th className="p-3 font-black">RETURNS</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-300">
                  {orders.map((order: any) => (
                    <tr key={order._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="p-3 font-mono text-sm">{order._id.substring(0, 10)}...</td>
                      <td className="p-3 font-bold dark:text-gray-100">{order.user?.name || 'Guest'}</td>
                      <td className="p-3 font-bold cursor-pointer">
                        <select 
                          value={order.status || 'Processing'}
                          onChange={(e) => statusHandler(order._id, e.target.value)}
                          className={`px-2 py-1 rounded font-bold text-xs text-white outline-none cursor-pointer ${order.status === 'Delivered' ? 'bg-green-500' : order.status === 'Shipped' ? 'bg-cyan-500' : order.status === 'Out for Delivery' ? 'bg-purple-500' : 'bg-yellow-500'}`}
                        >
                          <option value="Processing" className="bg-gray-800">Processing</option>
                          <option value="Shipped" className="bg-gray-800">Shipped</option>
                          <option value="Out for Delivery" className="bg-gray-800">Out for Delivery</option>
                          <option value="Delivered" className="bg-gray-800">Delivered</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <button className="text-sm bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 px-3 py-1 rounded hover:bg-gray-700 transition">View Details</button>
                      </td>
                      <td className="p-3">
                        {order.returnStatus === 'Requested' ? (
                          <div className="flex gap-2">
                            <span 
                              title={`Reason: ${order.returnReason}`}
                              className="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded cursor-help flex items-center gap-1"
                            >
                              Req
                            </span>
                            <button onClick={() => returnActionHandler(order._id, 'Approved')} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">Approve</button>
                            <button onClick={() => returnActionHandler(order._id, 'Rejected')} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">Reject</button>
                          </div>
                        ) : order.returnStatus === 'Approved' ? (
                          <span className="text-green-600 dark:text-green-400 font-extrabold text-xs uppercase">Approved</span>
                        ) : order.returnStatus === 'Rejected' ? (
                          <span className="text-red-500 dark:text-red-400 font-extrabold text-xs uppercase">Rejected</span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
