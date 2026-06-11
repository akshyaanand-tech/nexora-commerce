import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import LazyImage from '../ui/LazyImage';
import StarRating from '../ui/StarRating';
import { formatPrice } from '../../utils/api';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product, index = 0 }) {
  const [quickView, setQuickView] = useState(false);
  const [adding, setAdding] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const image = product.images?.[0] || '/placeholder.jpg';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    try {
      await addToCart(product.id);
    } catch {
      /* handled elsewhere */
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await toggleWishlist(product.id);
    } catch {
      /* silent */
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        whileHover={{ y: -4 }}
        className="group"
      >
        <Link to={`/product/${product.id}`} className="block">
          <div className="card overflow-hidden">
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-900">
              <LazyImage src={image} alt={product.name} className="w-full h-full" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={handleWishlist}
                  className="p-2.5 bg-white/90 dark:bg-nexora-dark-card/90 backdrop-blur rounded-lg shadow-soft hover:scale-105 transition-transform"
                >
                  <Heart size={16} className={isWishlisted(product.id) ? 'fill-red-500 text-red-500' : ''} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); setQuickView(true); }}
                  className="p-2.5 bg-white/90 dark:bg-nexora-dark-card/90 backdrop-blur rounded-lg shadow-soft hover:scale-105 transition-transform"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
            <div className="p-5">
              {product.category_name && (
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category_name}</p>
              )}
              <h3 className="font-medium text-sm mb-2 line-clamp-1 group-hover:text-nexora-light-accent dark:group-hover:text-nexora-dark-accent transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold">{formatPrice(product.price)}</span>
                <StarRating rating={product.rating} size={12} />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium border border-nexora-light-border dark:border-nexora-dark-border rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-nexora-light-primary hover:text-white dark:hover:bg-nexora-dark-primary dark:hover:text-nexora-dark-bg"
              >
                <ShoppingBag size={14} />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </Link>
      </motion.div>
      <QuickViewModal product={product} isOpen={quickView} onClose={() => setQuickView(false)} />
    </>
  );
}
