import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/products/ProductCard';
import RevealOnScroll from '../components/ui/RevealOnScroll';
import Button from '../components/ui/Button';
import { useEffect, useState } from 'react';
import { products, categories } from '../utils/api';

const testimonials = [
  { name: 'Sarah Chen', role: 'Product Designer', text: 'NEXORA changed how I think about online shopping. Every detail feels intentional.' },
  { name: 'Marcus Webb', role: 'Creative Director', text: 'The curation is impeccable. It is rare to find a store that matches the quality of its branding.' },
  { name: 'Elena Rodriguez', role: 'Architect', text: 'From browsing to delivery, the experience is seamless. This is what modern commerce should feel like.' },
];

export default function Landing() {
  const [trending, setTrending] = useState([]);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    products.getTrending().then(setTrending).catch(() => {});
    categories.getAll().then(setCats).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="landing" />

      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 bg-nexora-light-bg dark:bg-nexora-dark-bg" />
        <div className="section-padding relative z-10 py-20 lg:py-32">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-medium text-nexora-light-accent dark:text-nexora-dark-accent mb-6 tracking-wide"
            >
              Designed for Modern Shopping
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]"
            >
              Shopping Reimagined.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed"
            >
              Discover premium products with a seamless buying experience.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link to="/shop"><Button>Shop Now <ArrowRight size={16} /></Button></Link>
              <Link to="/shop?featured=true"><Button variant="secondary">Explore Collection</Button></Link>
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[45%] h-[70%]"
        >
          {trending[0] && (
            <img
              src={trending[0].images?.[0]}
              alt=""
              className="w-full h-full object-cover rounded-l-2xl shadow-lift dark:shadow-lift-dark"
            />
          )}
        </motion.div>
      </section>

      <section className="section-padding py-24">
        <RevealOnScroll>
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold">Featured Categories</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Curated collections for every lifestyle</p>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-1 text-sm font-medium text-nexora-light-accent dark:text-nexora-dark-accent hover:gap-2 transition-all">
              View all <ChevronRight size={16} />
            </Link>
          </div>
        </RevealOnScroll>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {cats.map((cat, i) => (
            <RevealOnScroll key={cat.id} delay={i * 0.1}>
              <Link to={`/shop?category=${cat.slug}`} className="group block">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display text-lg font-semibold text-white">{cat.name}</h3>
                    <p className="text-sm text-white/70 mt-1">{cat.product_count} products</p>
                  </div>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="section-padding py-24 bg-nexora-light-card dark:bg-nexora-dark-card border-y border-nexora-light-border dark:border-nexora-dark-border">
        <RevealOnScroll>
          <h2 className="font-display text-3xl font-bold mb-2">Trending Products</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-12">What our community is loving right now</p>
        </RevealOnScroll>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      <section id="about" className="section-padding py-24">
        <RevealOnScroll>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold mb-4">Built for the discerning buyer</h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              NEXORA is not another marketplace. We partner directly with designers and makers who share our obsession with quality, sustainability, and thoughtful design. Every product in our catalog has been selected because it earns its place.
            </p>
          </div>
        </RevealOnScroll>
      </section>

      <section className="section-padding py-24">
        <RevealOnScroll>
          <h2 className="font-display text-3xl font-bold text-center mb-12">What customers say</h2>
        </RevealOnScroll>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <RevealOnScroll key={t.name} delay={i * 0.1}>
              <div className="card p-8">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{t.role}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="section-padding py-24">
        <RevealOnScroll>
          <div className="card p-10 lg:p-16 text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-3">Stay in the loop</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">New arrivals, exclusive offers, and design insights. No noise.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="your@email.com" className="input-field flex-1" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </RevealOnScroll>
      </section>

      <Footer />
    </div>
  );
}
