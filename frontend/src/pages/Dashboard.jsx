import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, Heart, Settings, LogOut } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageTransition from '../components/ui/PageTransition';
import Button from '../components/ui/Button';
import ProductCard from '../components/products/ProductCard';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ThemeToggle from '../components/layout/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { orders, addresses, formatPrice } from '../utils/api';

const tabs = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function DashboardContent() {
  const { user, logout, updateProfile } = useAuth();
  const { items: wishlistItems, refreshWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderList, setOrderList] = useState([]);
  const [addressList, setAddressList] = useState([]);
  const [name, setName] = useState(user?.name || '');
  const [addressForm, setAddressForm] = useState({ full_name: '', street: '', city: '', state: '', zip_code: '', phone: '' });

  useEffect(() => {
    orders.getMy().then(setOrderList).catch(() => {});
    addresses.get().then(setAddressList).catch(() => {});
    refreshWishlist();
  }, [refreshWishlist]);

  const handleSaveProfile = async () => {
    try { await updateProfile(name); } catch { /* silent */ }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const addr = await addresses.create(addressForm);
      setAddressList([...addressList, addr]);
      setAddressForm({ full_name: '', street: '', city: '', state: '', zip_code: '', phone: '' });
    } catch { /* silent */ }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <div className="card p-4 h-fit">
        <div className="p-4 border-b border-nexora-light-border dark:border-nexora-dark-border mb-2">
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              activeTab === tab.id ? 'bg-gray-100 dark:bg-gray-800 font-medium' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 mt-2">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="lg:col-span-3">
        {activeTab === 'orders' && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-6">Order History</h2>
            {orderList.length === 0 ? (
              <p className="text-gray-500">No orders yet. <Link to="/shop" className="text-nexora-light-accent">Start shopping</Link></p>
            ) : (
              <div className="space-y-4">
                {orderList.map((order) => (
                  <div key={order.id} className="card p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                      <div>
                        <p className="font-mono text-sm">{order.order_number}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColors[order.status] || 'bg-gray-100'}`}>{order.status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                      <Link to={`/order-confirmation/${order.id}`} className="text-sm text-nexora-light-accent dark:text-nexora-dark-accent">View details</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-6">Saved Addresses</h2>
            <div className="space-y-4 mb-8">
              {addressList.map((a) => (
                <div key={a.id} className="card p-5 text-sm">
                  <p className="font-medium">{a.full_name}</p>
                  <p className="text-gray-500 mt-1">{a.street}, {a.city}, {a.state} {a.zip_code}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddAddress} className="card p-6 space-y-4">
              <h3 className="font-medium">Add New Address</h3>
              {Object.keys(addressForm).map((field) => (
                <input key={field} placeholder={field.replace('_', ' ')} value={addressForm[field]} onChange={(e) => setAddressForm({ ...addressForm, [field]: e.target.value })} className="input-field" required />
              ))}
              <Button type="submit">Save Address</Button>
            </form>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-6">Wishlist</h2>
            {wishlistItems.length === 0 ? (
              <p className="text-gray-500">Your wishlist is empty.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card p-8 space-y-6">
            <h2 className="font-display text-xl font-semibold">Account Settings</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
            <div className="border-t border-nexora-light-border dark:border-nexora-dark-border pt-6">
              <label className="block text-sm font-medium mb-3">Theme Preference</label>
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <PageTransition className="flex-1 pt-24 lg:pt-28">
          <div className="section-padding pb-24">
            <h1 className="font-display text-3xl font-bold mb-8">My Account</h1>
            <DashboardContent />
          </div>
        </PageTransition>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
