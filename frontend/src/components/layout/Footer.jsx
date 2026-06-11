import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-nexora-light-border dark:border-nexora-dark-border bg-nexora-light-card dark:bg-nexora-dark-card mt-auto">
      <div className="section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <h3 className="font-display text-xl font-bold mb-3">NEXORA</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Designed for Modern Shopping. Premium products, seamless experience.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/shop" className="hover:text-nexora-light-accent transition-colors">All Products</Link></li>
              <li><Link to="/shop?featured=true" className="hover:text-nexora-light-accent transition-colors">Featured</Link></li>
              <li><Link to="/shop?sort=rating" className="hover:text-nexora-light-accent transition-colors">Top Rated</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#about" className="hover:text-nexora-light-accent transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-nexora-light-accent transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-nexora-light-accent transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#" className="hover:text-nexora-light-accent transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-nexora-light-accent transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-nexora-light-accent transition-colors">Returns</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-nexora-light-border dark:border-nexora-dark-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} NEXORA. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-nexora-light-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-nexora-light-accent transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
