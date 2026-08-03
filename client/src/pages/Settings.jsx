import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Bell, Moon, Shield, MapPin, CreditCard, 
  ShoppingCart, Globe, Lock, Download, Trash2, 
  FileText, CheckCircle, HelpCircle, PhoneCall, 
  Info, RefreshCw, LogOut, ChevronRight, X, Plus, Edit2, 
  Check, Smartphone, Eye, EyeOff, Save, Volume2, Sparkles, MessageSquare
} from 'lucide-react';
import { logout, addAddress } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import { usePWAInstall } from '../hooks/usePWAInstall';

const SettingItem = ({ icon: Icon, title, description, onClick, rightContent }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-4 bg-white hover:bg-brand-dark-50 border-b border-brand-dark-100 cursor-pointer transition-all duration-200 last:border-b-0 active:bg-brand-dark-100/60"
  >
    <div className="flex items-center gap-3.5 min-w-0 pr-2">
      <div className="p-2.5 bg-brand-maroon-50 rounded-xl text-brand-maroon-700 shrink-0">
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-brand-dark-900 text-sm truncate">{title}</h3>
        {description && <p className="text-xs text-brand-dark-500 mt-0.5 truncate">{description}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {rightContent}
      <ChevronRight size={18} className="text-brand-dark-400" />
    </div>
  </div>
);

const SettingsSection = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-xs font-bold text-brand-dark-400 uppercase tracking-wider mb-2.5 px-4">{title}</h2>
    <div className="bg-white rounded-2xl border border-brand-dark-100 overflow-hidden shadow-sm">
      {children}
    </div>
  </div>
);

const ModalWrapper = ({ title, icon: Icon, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark-950/60 backdrop-blur-sm animate-fadeIn">
    <div className="absolute inset-0" onClick={onClose} />
    <div className="relative bg-white border border-brand-dark-100 rounded-3xl p-6 shadow-2xl w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-brand-dark-100 sticky top-0 bg-white z-20">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2.5 bg-brand-maroon-50 text-brand-maroon-700 rounded-xl">
              <Icon size={20} />
            </div>
          )}
          <h3 className="font-display font-bold text-lg text-brand-dark-900">{title}</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-brand-dark-400 hover:text-brand-dark-800 rounded-xl hover:bg-brand-dark-50 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div>{children}</div>
    </div>
  </div>
);

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isInstallable, installPWA } = usePWAInstall();

  // Active Modal State
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'addresses' | 'payments' | 'orderPref' | 'notifications' | 'emailPref' | 'appearance' | 'language' | 'security' | 'privacy' | 'terms' | 'policy' | 'help' | 'contact' | 'about'

  // Local Form / Preferences State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 9876543210');
  
  // Toggles State
  const [notifications, setNotifications] = useState({ push: true, order: true, promo: false, sound: true });
  const [emails, setEmails] = useState({ orderConfirm: true, shipping: true, promo: false, newsletter: true });
  const [appearance, setAppearance] = useState(localStorage.getItem('theme_preference') || 'system');
  const [language, setLanguage] = useState('English');
  const [paymentPref, setPaymentPref] = useState('UPI / GPay');
  const [orderPref, setOrderPref] = useState({ autoReceipt: true, smsAlert: true, defaultAddressIndex: 0 });

  // Security Form
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);

  // Address Modal State
  const [newAddr, setNewAddr] = useState({ label: 'Home', street: '', city: 'Panipat', state: 'Haryana', zip: '132103', phone: '' });

  // Contact Form State
  const [contactMsg, setContactMsg] = useState('');

  // Handlers
  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
    setActiveModal(null);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!passwords.newPass || passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully!');
    setPasswords({ current: '', newPass: '', confirm: '' });
    setActiveModal(null);
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddr.street) {
      toast.error('Please enter street address');
      return;
    }
    dispatch(addAddress(newAddr));
    toast.success('Address added successfully!');
    setNewAddr({ label: 'Home', street: '', city: 'Panipat', state: 'Haryana', zip: '132103', phone: '' });
  };

  const handleClearCache = () => {
    const loader = toast.loading('Clearing application cache...');
    setTimeout(() => {
      localStorage.removeItem('cached_products');
      toast.dismiss(loader);
      toast.success('App cache & temporary files cleared!');
    }, 600);
  };

  const handleCheckUpdates = () => {
    const loader = toast.loading('Checking for updates...');
    setTimeout(() => {
      toast.dismiss(loader);
      toast.success('You are on the latest version (v1.0.4 ✨)');
    }, 800);
  };

  const handleDownloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user || { name: profileName }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "merchstore_user_data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Personal data downloaded (.json)');
  };

  const handleSendContactMsg = (e) => {
    e.preventDefault();
    if (!contactMsg.trim()) return;
    toast.success('Thank you! Your message has been sent to support.');
    setContactMsg('');
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-brand-dark-50 pt-24 pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-brand-dark-900 mb-2">Settings</h1>
          <p className="text-brand-dark-600">Manage your account preferences and app settings</p>
        </div>

        {/* Profile Card Summary */}
        <div 
          onClick={() => setActiveModal('profile')}
          className="bg-white rounded-3xl p-6 border border-brand-dark-100 flex items-center justify-between mb-8 shadow-sm cursor-pointer hover:bg-brand-dark-50 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-maroon-700 to-brand-maroon-900 text-white flex items-center justify-center text-2xl font-bold font-display shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-dark-900 font-display">{user?.name || profileName}</h2>
              <p className="text-brand-dark-500 text-xs font-medium">{user?.email}</p>
              <span className="inline-block px-2.5 py-0.5 bg-brand-maroon-50 text-brand-maroon-700 text-[10px] font-bold rounded-md uppercase tracking-wider mt-1.5">
                {user?.role || 'Customer'}
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-brand-dark-50 rounded-xl text-brand-dark-400">
            <Edit2 size={18} />
          </div>
        </div>

        {/* Settings Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <SettingsSection title="Account Settings">
              <SettingItem 
                icon={User} title="Edit Profile" description="Name, phone number" 
                onClick={() => setActiveModal('profile')} 
              />
              <SettingItem 
                icon={MapPin} title="Addresses" description={`${user?.addresses?.length || 0} saved addresses`} 
                onClick={() => setActiveModal('addresses')} 
              />
              <SettingItem 
                icon={CreditCard} title="Payment Preferences" description={paymentPref} 
                onClick={() => setActiveModal('payments')} 
              />
              <SettingItem 
                icon={ShoppingCart} title="Order Preferences" description="Default address & receipt options" 
                onClick={() => setActiveModal('orderPref')} 
              />
            </SettingsSection>

            <SettingsSection title="App Preferences">
              <SettingItem 
                icon={Bell} title="Notifications" description="Push & order updates" 
                onClick={() => setActiveModal('notifications')} 
                rightContent={<span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${notifications.push ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-dark-100 text-brand-dark-500'}`}>{notifications.push ? 'ON' : 'OFF'}</span>}
              />
              <SettingItem 
                icon={Mail} title="Email Preferences" description="Order receipts & updates" 
                onClick={() => setActiveModal('emailPref')} 
              />
              <SettingItem 
                icon={Moon} title="Appearance" description="Theme customization" 
                onClick={() => setActiveModal('appearance')} 
                rightContent={<span className="text-xs font-medium text-brand-dark-500 capitalize">{appearance}</span>}
              />
              <SettingItem 
                icon={Globe} title="Language" description="App interface language" 
                onClick={() => setActiveModal('language')} 
                rightContent={<span className="text-xs font-medium text-brand-dark-500">{language}</span>}
              />
            </SettingsSection>
          </div>

          <div>
            <SettingsSection title="Security & Privacy">
              <SettingItem 
                icon={Shield} title="Security" description="Password & session management" 
                onClick={() => setActiveModal('security')} 
              />
              <SettingItem 
                icon={Lock} title="Privacy" description="Data permissions & export" 
                onClick={() => setActiveModal('privacy')} 
              />
              <SettingItem 
                icon={Trash2} title="Clear Cache" description="Free up local space" 
                onClick={handleClearCache} 
              />
            </SettingsSection>

            <SettingsSection title="Support & About">
              {isInstallable && (
                <SettingItem 
                  icon={Download} title="Install App" description="Install PWA on device" 
                  onClick={installPWA} 
                />
              )}
              <SettingItem 
                icon={HelpCircle} title="Help & Support" description="FAQs & assistance"
                onClick={() => setActiveModal('help')} 
              />
              <SettingItem 
                icon={PhoneCall} title="Contact Us" description="Direct email & helpline"
                onClick={() => setActiveModal('contact')} 
              />
              <SettingItem 
                icon={FileText} title="Terms & Conditions" description="Legal agreements"
                onClick={() => setActiveModal('terms')} 
              />
              <SettingItem 
                icon={CheckCircle} title="Privacy Policy" description="How we handle data"
                onClick={() => setActiveModal('policy')} 
              />
              <SettingItem 
                icon={Info} title="About MerchStore" description="Geeta University"
                onClick={() => setActiveModal('about')} 
                rightContent={<span className="text-xs font-semibold text-brand-maroon-700 bg-brand-maroon-50 px-2 py-0.5 rounded-lg">v1.0.4</span>}
              />
              <SettingItem 
                icon={RefreshCw} title="Check for Updates" description="Check latest software build"
                onClick={handleCheckUpdates} 
              />
            </SettingsSection>
          </div>
        </div>

        {/* Global Logout */}
        <div className="mt-8 mb-12">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold transition-all shadow-sm active:scale-[0.99]"
          >
            <LogOut size={20} />
            Logout from all devices
          </button>
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────── */}

      {/* 1. Edit Profile Modal */}
      {activeModal === 'profile' && (
        <ModalWrapper title="Edit Profile" icon={User} onClose={() => setActiveModal(null)}>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-3 border border-brand-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-dark-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-brand-dark-50 border border-brand-dark-200 rounded-xl text-sm text-brand-dark-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-brand-dark-400 mt-1">Email cannot be changed directly.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-dark-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-4 py-3 border border-brand-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-600"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-brand-maroon-700 hover:bg-brand-maroon-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors mt-2"
            >
              Save Changes
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* 2. Addresses Modal */}
      {activeModal === 'addresses' && (
        <ModalWrapper title="Saved Delivery Addresses" icon={MapPin} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            {user?.addresses && user.addresses.length > 0 ? (
              user.addresses.map((addr, idx) => (
                <div key={idx} className="p-4 bg-brand-dark-50 border border-brand-dark-200 rounded-2xl relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold bg-brand-maroon-100 text-brand-maroon-800 px-2 py-0.5 rounded-md uppercase">
                      {addr.label || 'Home'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-brand-dark-900 mt-2">{addr.street}</p>
                  <p className="text-xs text-brand-dark-600">{addr.city}, {addr.state} - {addr.zip}</p>
                  <p className="text-xs text-brand-dark-500 mt-1">Phone: {addr.phone}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-brand-dark-500 text-center py-4">No saved addresses found.</p>
            )}

            <div className="pt-4 border-t border-brand-dark-100">
              <h4 className="text-xs font-bold text-brand-dark-800 mb-3">Add New Address</h4>
              <form onSubmit={handleAddAddressSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Street / Flat / Landmark"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-brand-dark-200 rounded-xl text-xs"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-brand-dark-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddr.zip}
                    onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-brand-dark-200 rounded-xl text-xs"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number for Delivery"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-brand-dark-200 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-dark-900 hover:bg-brand-dark-950 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={16} /> Save Address
                </button>
              </form>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 3. Payment Preferences Modal */}
      {activeModal === 'payments' && (
        <ModalWrapper title="Payment Preferences" icon={CreditCard} onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            {['UPI / Google Pay / PhonePe', 'Credit / Debit Card', 'Cash on Delivery (COD)'].map((method) => (
              <div 
                key={method}
                onClick={() => { setPaymentPref(method); toast.success(`Default payment set to ${method}`); }}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${paymentPref === method ? 'bg-brand-maroon-50 border-brand-maroon-600 text-brand-maroon-900' : 'bg-white border-brand-dark-150 text-brand-dark-700'}`}
              >
                <span className="text-sm font-semibold">{method}</span>
                {paymentPref === method && <Check size={18} className="text-brand-maroon-700" />}
              </div>
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* 4. Order Preferences Modal */}
      {activeModal === 'orderPref' && (
        <ModalWrapper title="Order Preferences" icon={ShoppingCart} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-brand-dark-50 rounded-xl border border-brand-dark-100">
              <div>
                <h4 className="text-xs font-bold text-brand-dark-900">Auto Generate Receipt PDF</h4>
                <p className="text-[11px] text-brand-dark-500">Download invoice automatically upon order placement</p>
              </div>
              <input
                type="checkbox"
                checked={orderPref.autoReceipt}
                onChange={(e) => setOrderPref({ ...orderPref, autoReceipt: e.target.checked })}
                className="w-4 h-4 accent-brand-maroon-700 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-brand-dark-50 rounded-xl border border-brand-dark-100">
              <div>
                <h4 className="text-xs font-bold text-brand-dark-900">SMS Dispatch Alerts</h4>
                <p className="text-[11px] text-brand-dark-500">Receive SMS notifications on order dispatch</p>
              </div>
              <input
                type="checkbox"
                checked={orderPref.smsAlert}
                onChange={(e) => setOrderPref({ ...orderPref, smsAlert: e.target.checked })}
                className="w-4 h-4 accent-brand-maroon-700 cursor-pointer"
              />
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 5. Notifications Modal */}
      {activeModal === 'notifications' && (
        <ModalWrapper title="Notification Settings" icon={Bell} onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            {[
              { key: 'push', label: 'Push Notifications', desc: 'Receive real-time alerts on your device' },
              { key: 'order', label: 'Order Status Updates', desc: 'Alerts when order is packed or shipped' },
              { key: 'promo', label: 'Offers & Discounts', desc: 'Special merch discount coupons' },
              { key: 'sound', label: 'In-app Sound Alerts', desc: 'Play chime on new notifications' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3.5 bg-brand-dark-50 rounded-xl border border-brand-dark-100">
                <div>
                  <h4 className="text-xs font-bold text-brand-dark-900">{label}</h4>
                  <p className="text-[11px] text-brand-dark-500">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) => {
                    setNotifications({ ...notifications, [key]: e.target.checked });
                    toast.success('Notification settings saved');
                  }}
                  className="w-4 h-4 accent-brand-maroon-700 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* 6. Email Preferences Modal */}
      {activeModal === 'emailPref' && (
        <ModalWrapper title="Email Preferences" icon={Mail} onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            {[
              { key: 'orderConfirm', label: 'Order Confirmations', desc: 'Instant email receipts on checkout' },
              { key: 'shipping', label: 'Shipping Updates', desc: 'Tracking number & courier emails' },
              { key: 'promo', label: 'Promotional Offers', desc: 'New arrival alerts & sale discounts' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3.5 bg-brand-dark-50 rounded-xl border border-brand-dark-100">
                <div>
                  <h4 className="text-xs font-bold text-brand-dark-900">{label}</h4>
                  <p className="text-[11px] text-brand-dark-500">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={emails[key]}
                  onChange={(e) => {
                    setEmails({ ...emails, [key]: e.target.checked });
                    toast.success('Email preference saved');
                  }}
                  className="w-4 h-4 accent-brand-maroon-700 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* 7. Appearance Modal */}
      {activeModal === 'appearance' && (
        <ModalWrapper title="Appearance & Theme" icon={Moon} onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            {[
              { mode: 'system', label: 'System Default', desc: 'Match device system theme settings' },
              { mode: 'light', label: 'Light Theme', desc: 'Clean white background & dark text' },
              { mode: 'dark', label: 'Dark Mode', desc: 'Sleek dark theme for night browsing' },
            ].map(({ mode, label, desc }) => (
              <div
                key={mode}
                onClick={() => {
                  setAppearance(mode);
                  localStorage.setItem('theme_preference', mode);
                  toast.success(`Theme set to ${label}`);
                }}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${appearance === mode ? 'bg-brand-maroon-50 border-brand-maroon-600 text-brand-maroon-900' : 'bg-white border-brand-dark-150 text-brand-dark-700'}`}
              >
                <div>
                  <h4 className="text-sm font-bold">{label}</h4>
                  <p className="text-xs opacity-75">{desc}</p>
                </div>
                {appearance === mode && <Check size={18} className="text-brand-maroon-700" />}
              </div>
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* 8. Language Modal */}
      {activeModal === 'language' && (
        <ModalWrapper title="Language Settings" icon={Globe} onClose={() => setActiveModal(null)}>
          <div className="space-y-2">
            {['English', 'Hindi (हिंदी)', 'Haryanvi (हरियाणवी)', 'Punjabi (ਪੰਜਾਬੀ)'].map((lang) => (
              <div
                key={lang}
                onClick={() => {
                  setLanguage(lang.split(' ')[0]);
                  toast.success(`Language set to ${lang}`);
                  setActiveModal(null);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${language === lang.split(' ')[0] ? 'bg-brand-maroon-50 border-brand-maroon-600 text-brand-maroon-900 font-bold' : 'bg-white border-brand-dark-150 text-brand-dark-700'}`}
              >
                <span className="text-sm">{lang}</span>
                {language === lang.split(' ')[0] && <Check size={18} className="text-brand-maroon-700" />}
              </div>
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* 9. Security Modal */}
      {activeModal === 'security' && (
        <ModalWrapper title="Security Settings" icon={Shield} onClose={() => setActiveModal(null)}>
          <form onSubmit={handleSavePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-brand-dark-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-brand-dark-200 rounded-xl text-xs pr-10"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-brand-dark-400"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-dark-700 mb-1">New Password</label>
              <input
                type={showPass ? "text" : "password"}
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-brand-dark-200 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-dark-700 mb-1">Confirm New Password</label>
              <input
                type={showPass ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-brand-dark-200 rounded-xl text-xs"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-brand-maroon-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              Update Password
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* 10. Privacy Modal */}
      {activeModal === 'privacy' && (
        <ModalWrapper title="Privacy & Data Control" icon={Lock} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="p-4 bg-brand-dark-50 rounded-2xl border border-brand-dark-100">
              <h4 className="text-xs font-bold text-brand-dark-900 mb-1">Export My Personal Data</h4>
              <p className="text-[11px] text-brand-dark-500 mb-3">Download a copy of your account profile, addresses, and order history.</p>
              <button
                onClick={handleDownloadData}
                className="px-4 py-2 bg-brand-dark-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Download size={14} /> Download JSON
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 11. Terms & Conditions Modal */}
      {activeModal === 'terms' && (
        <ModalWrapper title="Terms & Conditions" icon={FileText} onClose={() => setActiveModal(null)}>
          <div className="space-y-3 text-xs text-brand-dark-600 leading-relaxed max-h-96 overflow-y-auto pr-1">
            <h4 className="font-bold text-brand-dark-900">1. Introduction</h4>
            <p>Welcome to Geeta University MerchStore. By placing an order or using our services, you agree to these terms.</p>
            <h4 className="font-bold text-brand-dark-900">2. Orders & Delivery</h4>
            <p>All merchandise items are subject to stock availability. Standard campus delivery takes 1-3 business days.</p>
            <h4 className="font-bold text-brand-dark-900">3. Cancellation & Refunds</h4>
            <p>Orders can be cancelled anytime before dispatch. Refund processing takes 3-5 business days back to your original payment method.</p>
          </div>
        </ModalWrapper>
      )}

      {/* 12. Privacy Policy Modal */}
      {activeModal === 'policy' && (
        <ModalWrapper title="Privacy Policy" icon={CheckCircle} onClose={() => setActiveModal(null)}>
          <div className="space-y-3 text-xs text-brand-dark-600 leading-relaxed max-h-96 overflow-y-auto pr-1">
            <h4 className="font-bold text-brand-dark-900">Data Collection</h4>
            <p>We collect your name, email, phone number, and delivery address strictly for order processing and delivery alerts.</p>
            <h4 className="font-bold text-brand-dark-900">Data Security</h4>
            <p>Your payment credentials are encrypted using bank-grade SSL protocol. We never store credit card numbers on our server.</p>
          </div>
        </ModalWrapper>
      )}

      {/* 13. Help & Support Modal */}
      {activeModal === 'help' && (
        <ModalWrapper title="Help & FAQs" icon={HelpCircle} onClose={() => setActiveModal(null)}>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-brand-dark-50 rounded-xl border border-brand-dark-100">
              <h4 className="font-bold text-brand-dark-900">How do I track my order?</h4>
              <p className="text-brand-dark-500 mt-1">Go to Dashboard &rarr; Orders &rarr; View Track Order for real-time live status.</p>
            </div>
            <div className="p-3 bg-brand-dark-50 rounded-xl border border-brand-dark-100">
              <h4 className="font-bold text-brand-dark-900">Can I cancel an order?</h4>
              <p className="text-brand-dark-500 mt-1">Yes! Click "Cancel Order" on your Dashboard before order status turns to Shipped.</p>
            </div>
            <div className="p-3 bg-brand-dark-50 rounded-xl border border-brand-dark-100">
              <h4 className="font-bold text-brand-dark-900">Where is the store located?</h4>
              <p className="text-brand-dark-500 mt-1">Geeta University Campus Store, NH-44, Panipat, Haryana.</p>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 14. Contact Us Modal */}
      {activeModal === 'contact' && (
        <ModalWrapper title="Contact Support" icon={PhoneCall} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noreferrer"
                className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold flex items-center justify-center gap-1.5"
              >
                <MessageSquare size={16} /> WhatsApp Us
              </a>
              <a 
                href="tel:+919876543210" 
                className="p-3 bg-brand-maroon-50 text-brand-maroon-800 rounded-xl border border-brand-maroon-200 font-bold flex items-center justify-center gap-1.5"
              >
                <PhoneCall size={16} /> Call Helpline
              </a>
            </div>

            <form onSubmit={handleSendContactMsg} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-brand-dark-800">Send us a direct message</label>
              <textarea
                rows={3}
                placeholder="Describe your issue or query..."
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-brand-dark-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon-600"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-brand-maroon-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Submit Query
              </button>
            </form>
          </div>
        </ModalWrapper>
      )}

      {/* 15. About MerchStore Modal */}
      {activeModal === 'about' && (
        <ModalWrapper title="About MerchStore" icon={Info} onClose={() => setActiveModal(null)}>
          <div className="text-center py-2 space-y-3">
            <img src="/logo.png" alt="MerchStore" className="w-16 h-16 mx-auto rounded-2xl shadow-md" />
            <h3 className="font-display font-bold text-lg text-brand-dark-900">Geeta University MerchStore</h3>
            <p className="text-xs text-brand-dark-500 max-w-xs mx-auto">Official Merchandise & Campus Gear Store of Geeta University, Panipat.</p>
            <div className="inline-block px-3 py-1 bg-brand-gold-50 border border-brand-gold-200 text-brand-gold-700 text-xs font-bold rounded-full">
              PWA Progressive Web App v1.0.4
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default Settings;
