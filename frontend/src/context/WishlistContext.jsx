import { createContext, useContext, useState, useCallback } from 'react';
import { wishlist as wishlistApi } from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const data = await wishlistApi.get();
      setItems(data);
    } catch {
      /* silent */
    }
  }, [user]);

  const isWishlisted = (productId) => items.some((i) => i.id === productId);

  const toggleWishlist = async (productId) => {
    if (!user) throw new Error('Please login to use wishlist');
    if (isWishlisted(productId)) {
      await wishlistApi.remove(productId);
      setItems((prev) => prev.filter((i) => i.id !== productId));
    } else {
      await wishlistApi.add(productId);
      await refreshWishlist();
    }
  };

  return (
    <WishlistContext.Provider value={{ items, refreshWishlist, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
