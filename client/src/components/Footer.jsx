import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-dark-900 text-brand-dark-300 font-sans mt-auto">
      <div className="border-b border-brand-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Free Campus Pickup', desc: 'Collect from Block A Office.' },
              { icon: ShieldCheck, title: 'Secure Payments', desc: 'Stripe-encrypted checkout.' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '7-day size exchange policy.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-maroon-900/50 border border-brand-maroon-800/30 rounded-xl text-brand-gold-500 flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-white text-sm">{title}</h4>
                  <p className="text-xs text-brand-dark-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="GU Logo" className="w-10 h-10 object-contain" />
              <span className="font-display font-bold text-base text-white">GEETA UNIVERSITY</span>
            </div>
            <p className="text-xs text-brand-dark-400 leading-relaxed max-w-xs">
              The official merchandise platform of Geeta University. Wear your academic pride.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-brand-gold-500 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-brand-gold-500 transition-colors">All Merchandise</Link></li>
              <li><Link to="/cart" className="hover:text-brand-gold-500 transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-brand-gold-500 cursor-pointer transition-colors">FAQ & Support</span></li>
              <li><span className="hover:text-brand-gold-500 cursor-pointer transition-colors">Return Policy</span></li>
              <li><span className="hover:text-brand-gold-500 cursor-pointer transition-colors">Size Guide</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-xs tracking-wider uppercase mb-4">Contact</h4>
            <ul className="space-y-2.5 text-xs text-brand-dark-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-gold-500 shrink-0 mt-0.5" />
                <span>Geeta University, NH-709, Panipat, Haryana 132145</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-gold-500 shrink-0" />
                <span>+91 99960 51000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-gold-500 shrink-0" />
                <span>merch@geetauniversity.edu.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-dark-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-brand-dark-500">
          <p>© {new Date().getFullYear()} Geeta University. All rights reserved.</p>
          <div className="flex gap-5">
            <span className="hover:text-brand-gold-500 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-brand-gold-500 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
