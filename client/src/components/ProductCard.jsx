import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Star, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { addToCart } from '../features/cart/cartSlice';
import { useAuth } from '../hooks/useAuth';
import { redirectToLogin } from '../utils/authRedirect';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const { _id, name, price, images, category, averageRating, sizes } = product;

  const totalStock = sizes.reduce((acc, curr) => acc + curr.stock, 0);
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= 10;

  const handleQuickAdd = (e) => {
    e.preventDefault();

    const availableSize = sizes.find((s) => s.stock > 0);
    if (!availableSize) {
      toast.error('This product is currently out of stock.');
      return;
    }

    if (!isLoggedIn) {
      toast.error('Please login to add items to your cart.');
      redirectToLogin(navigate, location, {
        productId: _id,
        qty: 1,
        size: availableSize.size,
        productName: name,
      });
      return;
    }

    dispatch(addToCart({ productId: _id, qty: 1, size: availableSize.size }))
      .unwrap()
      .then(() => {
        toast.success(`Added ${name} (${availableSize.size}) to cart!`);
      })
      .catch((err) => {
        toast.error(err || 'Failed to add item');
      });
  };

  return (
    <Link
      to={`/products/${_id}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-brand-dark-100 overflow-hidden hover:border-brand-maroon-200 hover:shadow-premium transition-all duration-300 relative"
    >
      <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm border border-brand-dark-100 font-sans font-semibold text-[9px] text-brand-maroon-700 tracking-wider uppercase">
        {category}
      </span>

      {isOutOfStock && (
        <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-brand-dark-800 text-white font-sans font-bold text-[9px] uppercase">
          Sold Out
        </span>
      )}
      {!isOutOfStock && isLowStock && (
        <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-brand-gold-500 text-brand-dark-950 font-sans font-bold text-[9px] uppercase">
          {totalStock} Left
        </span>
      )}

      <div className="relative aspect-[4/5] bg-brand-dark-50 overflow-hidden">
        <img
          src={images[0]}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />

        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 p-2.5 bg-brand-maroon-700 hover:bg-brand-maroon-600 text-white rounded-xl shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10"
            title="Quick Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow gap-2">
        <div className="flex items-center gap-1">
          <div className="flex text-brand-gold-500">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                className={`w-3 h-3 ${
                  idx < Math.round(averageRating) ? 'fill-brand-gold-500' : 'text-brand-dark-200'
                }`}
              />
            ))}
          </div>
          <span className="font-sans text-[10px] text-brand-dark-400 font-medium">
            {averageRating.toFixed(1)}
          </span>
        </div>

        <h3 className="font-display font-bold text-sm text-brand-dark-900 leading-snug group-hover:text-brand-maroon-700 transition-colors line-clamp-2">
          {name}
        </h3>

        <div className="mt-auto pt-1">
          <span className="font-sans font-bold text-base text-brand-dark-900">
            ₹{price.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
