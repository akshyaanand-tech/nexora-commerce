import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar({ variant = 'default' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { summary } = useCart();
  const location = useLocation();
  const isLanding = variant === 'landing';

  const links = [
    { to: '/shop', label: 'Products' },
    { to: '/shop', label: 'Categories' },
    { to: '/#about', label: 'About' },
    { to: '/#contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isLanding && location.pathname === '/'
        ? 'bg-transparent'
        : 'bg-nexora-light-bg/80 dark:bg-nexora-dark-bg/80 backdrop-blur-xl border-b border-nexora-light-border dark:border-nexora-dark-border'
    }`}>
      <div className="section-padding">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            NEXORA
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-nexora-light-accent dark:hover:text-nexora-dark-accent ${
                  isActive(link.to) ? 'text-nexora-light-accent dark:text-nexora-dark-accent' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden sm:flex" />
            {user ? (
              <>
                <Link to="/cart" className="relative p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-nexora-dark-card transition-colors">
                  <ShoppingBag size={20} />
                  {summary.itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-nexora-light-accent dark:bg-nexora-dark-accent text-white text-xs rounded-full flex items-center justify-center">
                      {summary.itemCount}
                    </span>
                  )}
                </Link>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-nexora-dark-card transition-colors">
                  <User size={20} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-nexora-light-primary dark:hover:text-nexora-dark-primary transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm !px-4 !py-2">
                  Sign Up
                </Link>
              </>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2.5">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-nexora-light-border dark:border-nexora-dark-border bg-nexora-light-bg dark:bg-nexora-dark-bg"
          >
            <div className="section-padding py-4 flex flex-col gap-3">
              {links.map((link) => (
                <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">
                  {link.label}
                </Link>
              ))}
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
