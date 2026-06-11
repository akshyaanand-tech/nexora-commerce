import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import LazyImage from '../ui/LazyImage';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import { formatPrice } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAdd = async () => {
    if (!user) return;
    setAdding(true);
    try {
      await addToCart(product.id);
      onClose();
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="grid md:grid-cols-2 gap-8">
        <LazyImage
          src={product.images?.[0]}
          alt={product.name}
          className="aspect-square rounded-xl"
        />
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{product.category_name}</p>
          <h3 className="font-display text-2xl font-semibold mb-3">{product.name}</h3>
          <StarRating rating={product.rating} showValue />
          <p className="font-display text-2xl font-bold mt-4 mb-4">{formatPrice(product.price)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
            {product.description}
          </p>
          <div className="flex gap-3">
            <Button onClick={handleAdd} disabled={adding || !user}>
              {adding ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Link to={`/product/${product.id}`} onClick={onClose}>
              <Button variant="secondary">View Details</Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
