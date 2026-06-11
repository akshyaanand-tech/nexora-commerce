import { useEffect, useState } from 'react';
import { BarChart3, Package, Users, ShoppingCart, Plus, Trash2, Edit2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageTransition from '../components/ui/PageTransition';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { admin, products, categories, orders, formatPrice } from '../utils/api';

const adminTabs = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'users', label: 'Users', icon: Users },
];

const emptyProduct = { name: '', description: '', price: '', category_id: '', stock: '', images: [''], featured: false, specifications: {} };

function AdminContent() {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [productList, setProductList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [catList, setCatList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  const loadData = async () => {
    try {
      const [a, p, o, u, c] = await Promise.all([
        admin.getAnalytics(),
        products.getAll({ limit: 50 }),
        orders.getAll(),
        admin.getUsers(),
        categories.getAll(),
      ]);
      setAnalytics(a);
      setProductList(p);
      setOrderList(o);
      setUserList(u);
      setCatList(c);
    } catch { /* silent */ }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyProduct); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p, price: p.price.toString(), stock: p.stock.toString(), images: p.images.length ? p.images : [''], category_id: p.category_id || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const body = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category_id: form.category_id ? parseInt(form.category_id) : null,
      images: form.images.filter(Boolean),
    };
    if (editing) await products.update(editing.id, body);
    else await products.create(body);
    setModalOpen(false);
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product?')) {
      await products.delete(id);
      loadData();
    }
  };

  const updateOrderStatus = async (id, status) => {
    await orders.updateStatus(id, status);
    loadData();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {adminTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-nexora-light-primary text-white dark:bg-nexora-dark-primary dark:text-nexora-dark-bg' : 'card hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'analytics' && analytics && (
        <div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Revenue', value: formatPrice(analytics.revenue) },
              { label: 'Orders', value: analytics.orderCount },
              { label: 'Products', value: analytics.productCount },
              { label: 'Users', value: analytics.userCount },
            ].map((s) => (
              <div key={s.label} className="card p-6">
                <p className="text-sm text-gray-400">{s.label}</p>
                <p className="font-display text-2xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {analytics.recentOrders.map((o) => (
                  <div key={o.id} className="flex justify-between text-sm">
                    <span>{o.order_number}</span>
                    <span className="font-medium">{formatPrice(o.total_amount)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Top Products</h3>
              <div className="space-y-3">
                {analytics.topProducts.map((p) => (
                  <div key={p.name} className="flex justify-between text-sm">
                    <span>{p.name}</span>
                    <span className="text-gray-400">{p.sold} sold</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl font-semibold">Products ({productList.length})</h2>
            <Button onClick={openCreate}><Plus size={16} /> Add Product</Button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-nexora-light-border dark:border-nexora-dark-border">
                <tr className="text-left text-gray-400">
                  <th className="p-4">Name</th>
                  <th className="p-4 hidden sm:table-cell">Price</th>
                  <th className="p-4 hidden md:table-cell">Stock</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productList.map((p) => (
                  <tr key={p.id} className="border-b border-nexora-light-border dark:border-nexora-dark-border last:border-0">
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4 hidden sm:table-cell">{formatPrice(p.price)}</td>
                    <td className="p-4 hidden md:table-cell">{p.stock}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orderList.map((o) => (
            <div key={o.id} className="card p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-sm">{o.order_number}</p>
                <p className="text-xs text-gray-400">{o.user_name} - {new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <p className="font-semibold">{formatPrice(o.total_amount)}</p>
              <select
                value={o.status}
                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                className="input-field !w-auto !py-2 text-sm capitalize"
              >
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-nexora-light-border dark:border-nexora-dark-border">
              <tr className="text-left text-gray-400">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((u) => (
                <tr key={u.id} className="border-b border-nexora-light-border dark:border-nexora-dark-border last:border-0">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4 text-gray-400">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => admin.updateUserRole(u.id, e.target.value).then(loadData)}
                      className="input-field !w-auto !py-1.5 text-sm capitalize"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <div className="space-y-4">
          {['name', 'description', 'price', 'stock'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
              {field === 'description' ? (
                <textarea value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="input-field min-h-[80px]" />
              ) : (
                <input type={field === 'price' || field === 'stock' ? 'number' : 'text'} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="input-field" />
              )}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
              <option value="">Select category</option>
              {catList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input value={form.images[0] || ''} onChange={(e) => setForm({ ...form, images: [e.target.value] })} className="input-field" placeholder="https://..." />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured product
          </label>
          <Button onClick={handleSave}>{editing ? 'Update' : 'Create'} Product</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen">
        <Navbar />
        <PageTransition className="pt-24 lg:pt-28">
          <div className="section-padding pb-24">
            <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-500 mb-8">Manage your store</p>
            <AdminContent />
          </div>
        </PageTransition>
      </div>
    </ProtectedRoute>
  );
}
