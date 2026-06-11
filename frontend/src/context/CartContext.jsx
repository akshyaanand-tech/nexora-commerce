import { createContext, useContext, useState, useCallback } from 'react';
import { cart as cartApi } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0, itemCount: 0 });
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSummary({ subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0, itemCount: 0 });
      setCoupon(null);
      return;
    }
    try {
      const data = await cartApi.get();
      setItems(data.items);
      setSummary(data.summary);
      setCoupon(data.coupon);
    } catch {
      /* silent */
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) throw new Error('Please login to add items to cart');
    setLoading(true);
    try {
      const data = await cartApi.add(productId, quantity);
      setItems(data.items);
      setSummary(data.summary);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const data = await cartApi.update(productId, quantity);
      setItems(data.items);
      setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const data = await cartApi.remove(productId);
      setItems(data.items);
      setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code) => {
    const data = await cartApi.applyCoupon(code);
    setItems(data.items);
    setSummary(data.summary);
    setCoupon(data.coupon);
    return data;
  };

  const removeCoupon = async () => {
    const data = await cartApi.removeCoupon();
    setItems(data.items);
    setSummary(data.summary);
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        coupon,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
