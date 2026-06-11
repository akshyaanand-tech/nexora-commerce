import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, ZoomIn } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/products/ProductCard';
import PageTransition from '../components/ui/PageTransition';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import LazyImage from '../components/ui/LazyImage';
import { products, formatPrice } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    products.getById(id).then((p) => { setProduct(p); setActiveImage(0); }).catch(() => navigate('/shop'));
    products.getRelated(id).then(setRelated).catch(() => {});
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try { await addToCart(product.id, quantity); } finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-nexora-light-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const specs = product.specifications || {};

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 pt-24 lg:pt-28">
        <div className="section-padding pb-24">
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-nexora-light-accent mb-8 transition-colors">
            <ChevronLeft size={16} /> Back to shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 cursor-zoom-in" onClick={() => setZoomed(true)}>
                <AnimatePresence mode="wait">
                  <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full h-full">
                    <LazyImage src={product.images[activeImage]} alt={product.name} className="w-full h-full" />
                  </motion.div>
                </AnimatePresence>
                <button className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-nexora-dark-card/80 rounded-lg backdrop-blur">
                  <ZoomIn size={18} />
                </button>
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-nexora-light-accent dark:border-nexora-dark-accent' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{product.category_name}</p>
              <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-6">
                <StarRating rating={product.rating} showValue />
                <span className="text-sm text-gray-400">{product.review_count} reviews</span>
              </div>
              <p className="font-display text-3xl font-bold mb-6">{formatPrice(product.price)}</p>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">{product.description}</p>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-nexora-light-border dark:border-nexora-dark-border rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 dark:hover:bg-nexora-dark-card"><Minus size={16} /></button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 dark:hover:bg-nexora-dark-card"><Plus size={16} /></button>
                </div>
                <span className="text-sm text-gray-400">{product.stock} in stock</span>
              </div>

              <div className="flex flex-wrap gap-3 mb-10">
                <Button onClick={handleAddToCart} disabled={adding}>
                  <ShoppingBag size={16} /> {adding ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button variant="accent" onClick={handleBuyNow}>Buy Now</Button>
                <button
                  onClick={() => user ? toggleWishlist(product.id) : navigate('/login')}
                  className="p-3 border border-nexora-light-border dark:border-nexora-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-nexora-dark-card transition-colors"
                >
                  <Heart size={20} className={isWishlisted(product.id) ? 'fill-red-500 text-red-500' : ''} />
                </button>
              </div>

              {Object.keys(specs).length > 0 && (
                <div className="border-t border-nexora-light-border dark:border-nexora-dark-border pt-8">
                  <h3 className="font-semibold mb-4">Specifications</h3>
                  <dl className="space-y-3">
                    {Object.entries(specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <dt className="text-gray-500">{key}</dt>
                        <dd className="font-medium">{val}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {product.reviews?.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl font-bold mb-8">Reviews</h2>
              <div className="space-y-6">
                {product.reviews.map((r) => (
                  <div key={r.id} className="card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">{r.user_name}</span>
                      <StarRating rating={r.rating} size={12} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{r.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl font-bold mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </section>
          )}
        </div>
      </PageTransition>

      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 cursor-zoom-out"
            onClick={() => setZoomed(false)}
          >
            <img src={product.images[activeImage]} alt={product.name} className="max-w-full max-h-full object-contain" />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
