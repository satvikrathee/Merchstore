import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, ShoppingBag, Award, Shield, CheckCircle, Sparkles } from 'lucide-react';
import { fetchProducts } from '../features/products/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Home = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.products);
  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const featuredProducts = useMemo(() => safeProducts.filter((p) => p.isFeatured).slice(0, 4), [safeProducts]);

  const categoryData = useMemo(() => {
    const defaultCategories = [
      {
        name: 'Premium Hoodies',
        slug: 'hoodies',
        description: 'Heavyweight fleece with gold embroidery.',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400',
      },
      {
        name: 'Heritage Tees',
        slug: 'tshirts',
        description: '100% combed cotton comfort wear.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400',
      },
      {
        name: 'Campus Sweatshirts',
        slug: 'sweatshirts',
        description: 'Minimalist classic crewnecks.',
        image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&q=80&w=400',
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Caps, journals & thermal flasks.',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
      },
    ];

    return defaultCategories.map((cat) => {
      const targetSlug = cat.slug === 'sweatshirts' ? 'hoodies' : cat.slug;
      const catProducts = safeProducts.filter(
        (p) => p.category === targetSlug && p.images && p.images.length > 0 && p.isActive
      );
      if (catProducts.length > 0) {
        const randomIndex = Math.floor(Math.random() * catProducts.length);
        const randomProduct = catProducts[randomIndex];
        return {
          ...cat,
          image: randomProduct.images[0],
        };
      }
      return cat;
    });
  }, [safeProducts]);

  const assurances = [
    { icon: Award, title: 'Premium Craftsmanship', desc: 'Shrinkage-free fabrics selected for durability and comfort.' },
    { icon: Shield, title: 'Official GU Identity', desc: 'Authorized crest prints verified by the university design team.' },
    { icon: CheckCircle, title: 'Student-Centric Support', desc: 'Hassle-free size replacement and campus pickup options.' },
  ];

  return (
    <div className="bg-brand-dark-50 min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-dark-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-maroon-800/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-gold-600/15 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:28px_28px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 animate-slideUp">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-gold-400 font-sans font-medium text-xs tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Official GU Merchandise Hub
              </span>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
                Wear Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold-400 to-brand-gold-500">
                  Pride
                </span>
                .<br />
                Own Your Legacy.
              </h1>
              <p className="font-sans text-base sm:text-lg text-white/60 max-w-lg leading-relaxed">
                Premium campus apparel crafted for Geeta University students and faculty. Comfort, quality, and pride in every stitch.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/products" className="btn-gold px-7 py-3 text-sm">
                  Explore Catalog
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="px-7 py-3 rounded-xl border border-white/15 text-white/80 hover:text-white hover:bg-white/5 font-medium text-sm transition-all flex items-center gap-2"
                >
                  Join Member Club
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:block animate-fadeIn">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-brand-maroon-700/20 to-brand-gold-500/20 rounded-3xl blur-xl" />
                <div className="relative overflow-hidden rounded-2xl bg-brand-dark-900 border border-white/10 aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600"
                    alt="GU Varsity Hoodie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 p-4 glass-panel-dark rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-display font-bold text-sm text-white">GU Varsity Hoodie</p>
                      <p className="font-sans text-xs text-brand-gold-400 mt-0.5">₹1,499 — Pure Cotton Fleece</p>
                    </div>
                    <Link to="/products" className="p-2.5 bg-brand-gold-500 text-brand-dark-950 rounded-lg hover:bg-brand-gold-400 transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assurances */}
      <section className="py-10 bg-white border-b border-brand-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assurances.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-brand-dark-50 transition-colors">
                <div className="p-2.5 bg-brand-maroon-50 text-brand-maroon-700 rounded-xl flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-brand-dark-900 text-sm">{title}</h3>
                  <p className="font-sans text-xs text-brand-dark-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">Shop by Category</h2>
            <div className="w-12 h-0.5 bg-brand-gold-500 mx-auto mt-4 rounded-full" />
            <p className="section-subheading mx-auto">
              Browse student collections, accessories, and daily wear.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {categoryData.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-brand-dark-100 hover:border-brand-maroon-200 transition-all duration-300 hover:shadow-premium"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-950/90 via-brand-dark-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-brand-gold-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="font-sans text-[11px] text-white/50 mt-1 hidden sm:block">{cat.description}</p>
                  <div className="flex items-center gap-1 text-brand-gold-400 font-sans font-medium text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-16 sm:py-20 bg-white border-y border-brand-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="section-heading text-2xl sm:text-3xl">Trending Merchandise</h2>
              <p className="font-sans text-sm text-brand-dark-500 mt-2">
                Popular picks among students and faculty.
              </p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1.5 font-sans font-semibold text-sm text-brand-maroon-700 hover:text-brand-maroon-600 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center sm:hidden mt-8">
            <Link to="/products" className="inline-flex items-center gap-1.5 font-sans font-semibold text-sm text-brand-maroon-700">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden bg-brand-maroon-800">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-5">
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-white tracking-tight">
            Ready to Represent Geeta University?
          </h2>
          <p className="font-sans text-sm sm:text-base text-brand-maroon-100/80 max-w-xl mx-auto">
            Get 10% off your first purchase with code{' '}
            <strong className="text-brand-gold-300 font-bold border-b border-dashed border-brand-gold-400/50 px-1">
              WELCOME10
            </strong>{' '}
            at checkout.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-brand-gold-400 text-brand-maroon-900 font-sans font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm"
          >
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
