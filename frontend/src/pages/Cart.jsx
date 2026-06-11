import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageTransition from '../components/ui/PageTransition';
import Button from '../components/ui/Button';
import LazyImage from '../components/ui/LazyImage';
import { formatPrice } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function CartContent() {
  const { items, summary, coupon, updateQuantity, removeFromCart, applyCoupon, removeCoupon, refreshCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const handleCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-6">Your cart is empty</p>
        <Link to="/shop"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="card p-5 flex gap-5">
            <LazyImage src={item.images?.[0]} alt={item.name} className="w-24 h-24 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.product_id}`} className="font-medium hover:text-nexora-light-accent transition-colors">{item.name}</Link>
              <p className="text-sm text-gray-400 mt-1">{formatPrice(item.price)}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-nexora-light-border dark:border-nexora-dark-border rounded-lg">
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-2"><Minus size={14} /></button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-2"><Plus size={14} /></button>
                </div>
                <button onClick={() => removeFromCart(item.product_id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 h-fit sticky top-28">
        <h3 className="font-display text-lg font-semibold mb-6">Order Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(summary.subtotal)}</span></div>
          {summary.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(summary.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatPrice(summary.tax)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{summary.shipping === 0 ? 'Free' : formatPrice(summary.shipping)}</span></div>
          <div className="border-t border-nexora-light-border dark:border-nexora-dark-border pt-3 flex justify-between font-semibold text-base">
            <span>Total</span><span>{formatPrice(summary.total)}</span>
          </div>
        </div>

        <form onSubmit={handleCoupon} className="mt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="input-field pl-9 text-sm !py-2.5"
                disabled={!!coupon}
              />
            </div>
            {coupon ? (
              <button type="button" onClick={removeCoupon} className="text-sm text-red-500 px-3">Remove</button>
            ) : (
              <Button type="submit" variant="secondary" className="!px-4 !py-2.5 text-sm">Apply</Button>
            )}
          </div>
          {coupon && <p className="text-xs text-green-600 mt-2">Coupon {coupon} applied</p>}
          {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
        </form>

        <Button className="w-full mt-6" onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>
      </div>
    </div>
  );
}

export default function Cart() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <PageTransition className="flex-1 pt-24 lg:pt-28">
          <div className="section-padding pb-24">
            <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart</h1>
            <CartContent />
          </div>
        </PageTransition>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
