import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageTransition from '../components/ui/PageTransition';
import Button from '../components/ui/Button';
import { orders, formatPrice } from '../utils/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orders.getById(id).then(setOrder).catch(() => {});
  }, [id]);

  const orderNumber = location.state?.orderNumber || order?.order_number;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 pt-24 lg:pt-28">
        <div className="section-padding pb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={32} className="text-green-600" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold mb-3">Order Confirmed</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Thank you for your purchase.</p>
            {orderNumber && (
              <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 inline-block px-4 py-2 rounded-lg mb-8">
                {orderNumber}
              </p>
            )}
            {order && (
              <div className="card p-6 text-left mb-8">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="capitalize font-medium text-green-600">{order.status}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard"><Button variant="secondary">View Orders</Button></Link>
              <Link to="/shop"><Button>Continue Shopping</Button></Link>
            </div>
          </motion.div>
        </div>
      </PageTransition>
      <Footer />
    </div>
  );
}
