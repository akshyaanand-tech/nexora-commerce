import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageTransition from '../components/ui/PageTransition';
import Button from '../components/ui/Button';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useCart } from '../context/CartContext';
import { orders, addresses, formatPrice } from '../utils/api';

function CheckoutContent() {
  const { items, summary, refreshCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [form, setForm] = useState({
    full_name: '', street: '', city: '', state: '', zip_code: '', country: 'United States', phone: '',
    paymentMethod: 'card',
  });

  useEffect(() => { refreshCart(); addresses.get().then(setSavedAddresses).catch(() => {}); }, [refreshCart]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const result = await orders.create({
        shippingAddress: {
          full_name: form.full_name,
          street: form.street,
          city: form.city,
          state: form.state,
          zip_code: form.zip_code,
          country: form.country,
          phone: form.phone,
        },
        paymentMethod: form.paymentMethod,
      });
      navigate(`/order-confirmation/${result.order.id}`, { state: { orderNumber: result.orderNumber } });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const steps = ['Shipping', 'Payment', 'Review'];

  return (
    <div>
      <div className="flex items-center gap-4 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step > i + 1 ? 'bg-nexora-light-accent text-white' : step === i + 1 ? 'bg-nexora-light-primary text-white dark:bg-nexora-dark-primary dark:text-nexora-dark-bg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>{i + 1}</div>
            <span className={`text-sm hidden sm:inline ${step === i + 1 ? 'font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200 dark:bg-gray-700" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card p-8 space-y-5">
              <h2 className="font-display text-xl font-semibold mb-2">Shipping Address</h2>
              {savedAddresses.length > 0 && (
                <div className="mb-4 space-y-2">
                  {savedAddresses.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setForm({ ...form, full_name: a.full_name, street: a.street, city: a.city, state: a.state, zip_code: a.zip_code, country: a.country, phone: a.phone || '' })}
                      className="w-full text-left p-4 border border-nexora-light-border dark:border-nexora-dark-border rounded-lg hover:border-nexora-light-accent transition-colors text-sm"
                    >
                      <p className="font-medium">{a.full_name}</p>
                      <p className="text-gray-500">{a.street}, {a.city}, {a.state} {a.zip_code}</p>
                    </button>
                  ))}
                </div>
              )}
              {['full_name', 'street', 'city', 'state', 'zip_code', 'phone'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-2 capitalize">{field.replace('_', ' ')}</label>
                  <input
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              ))}
              <Button onClick={() => setStep(2)} disabled={!form.full_name || !form.street}>Continue to Payment</Button>
            </div>
          )}

          {step === 2 && (
            <div className="card p-8">
              <h2 className="font-display text-xl font-semibold mb-6">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'card', label: 'Credit / Debit Card' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'apple_pay', label: 'Apple Pay' },
                ].map((m) => (
                  <label key={m.id} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    form.paymentMethod === m.id ? 'border-nexora-light-accent dark:border-nexora-dark-accent bg-blue-50/50 dark:bg-blue-900/10' : 'border-nexora-light-border dark:border-nexora-dark-border'
                  }`}>
                    <input type="radio" name="payment" value={m.id} checked={form.paymentMethod === m.id} onChange={() => setForm({ ...form, paymentMethod: m.id })} />
                    <span className="text-sm font-medium">{m.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Review Order</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card p-8">
              <h2 className="font-display text-xl font-semibold mb-6">Order Review</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Shipping to</p>
                  <p className="font-medium">{form.full_name}</p>
                  <p>{form.street}, {form.city}, {form.state} {form.zip_code}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Payment</p>
                  <p className="font-medium capitalize">{form.paymentMethod.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">Items ({items.length})</p>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 h-fit">
          <h3 className="font-semibold mb-4">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(summary.subtotal)}</span></div>
            {summary.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(summary.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatPrice(summary.tax)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{summary.shipping === 0 ? 'Free' : formatPrice(summary.shipping)}</span></div>
            <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>{formatPrice(summary.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <PageTransition className="flex-1 pt-24 lg:pt-28">
          <div className="section-padding pb-24">
            <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
            <CheckoutContent />
          </div>
        </PageTransition>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
