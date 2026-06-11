import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/products/ProductCard';
import PageTransition from '../components/ui/PageTransition';
import RevealOnScroll from '../components/ui/RevealOnScroll';
import { products, categories } from '../utils/api';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productList, setProductList] = useState([]);
  const [cats, setCats] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const featured = searchParams.get('featured') || '';

  useEffect(() => {
    categories.getAll().then(setCats).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (featured) params.featured = featured;
    products.getAll(params).then(setProductList).catch(() => {}).finally(() => setLoading(false));
  }, [category, search, sort, featured]);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (search) p.set('search', search); else p.delete('search');
    setSearchParams(p);
  };

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 pt-24 lg:pt-28">
        <div className="section-padding pb-24">
          <RevealOnScroll>
            <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Shop</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Premium products, thoughtfully curated</p>
          </RevealOnScroll>

          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-11"
              />
            </form>
            <div className="flex gap-3 overflow-x-auto pb-1">
              <select
                value={category}
                onChange={(e) => setFilter('category', e.target.value)}
                className="input-field !w-auto min-w-[140px]"
              >
                <option value="">All Categories</option>
                {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
              <select
                value={sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                className="input-field !w-auto min-w-[140px]"
              >
                <option value="">Sort by</option>
                <option value="name">Name</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card aspect-[3/4] animate-pulse bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : productList.length === 0 ? (
            <div className="text-center py-20">
              <SlidersHorizontal size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productList.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </PageTransition>
      <Footer />
    </div>
  );
}
