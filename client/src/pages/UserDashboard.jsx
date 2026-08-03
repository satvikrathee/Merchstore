import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Eye, Plus, Trash, Shield, LogOut, Download, FileText, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { fetchUserOrders, updateOrderStatusInList, cancelOrder } from '../features/orders/orderSlice';

import { addAddress, logout } from '../features/auth/authSlice';
import { useUserOrdersSocket } from '../hooks/useUserOrdersSocket';
import Loader from '../components/Loader';
import { downloadReceipt } from '../utils/receiptGenerator';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: orders, loading: ordersLoading } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState('orders'); // tabs: 'orders', 'addresses', 'profile'
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);



  const handleOrderStatusUpdate = useCallback((payload) => {
    dispatch(updateOrderStatusInList({
      orderId: payload.orderId,
      status: payload.status,
      paymentStatus: payload.paymentStatus,
    }));
    if (payload.status) {
      toast.success(`Your order #${payload.orderId.slice(-6)} is now ${payload.status}!`, {
        icon: '📦',
        duration: 4000,
      });
    }
    if (payload.paymentStatus) {
      toast.success(`Order #${payload.orderId.slice(-6)} payment status is now ${payload.paymentStatus}!`, {
        icon: '💳',
        duration: 4000,
      });
    }
  }, [dispatch]);

  useUserOrdersSocket(
    orders.map((ord) => ord._id),
    handleOrderStatusUpdate
  );

  if (user?.role === 'admin') {
    return <Navigate to="/admin/analytics" replace />;
  }

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    setIsCancelling(true);
    try {
      await dispatch(cancelOrder({ orderId: cancelOrderId, reason: cancelReason })).unwrap();
      toast.success('Order cancelled successfully. Your stock has been restored.', { icon: '✅', duration: 4000 });
      dispatch(fetchUserOrders());
    } catch (err) {
      toast.error(err || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
      setCancelOrderId(null);
      setCancelReason('');
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!street || !city || !stateName || !pincode) {
      toast.error('All address fields are required.');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Pincode must be exactly 6 digits.');
      return;
    }

    dispatch(addAddress({
      street,
      city,
      state: stateName,
      pincode,
      isDefault: user?.addresses?.length === 0
    }))
      .unwrap()
      .then(() => {
        toast.success('Address added successfully');
        setStreet('');
        setCity('');
        setStateName('');
        setPincode('');
        setShowAddressForm(false);
      })
      .catch(() => {
        toast.error('Failed to save address');
      });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'packed': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-brand-dark-100 text-brand-dark-700 border-brand-dark-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen text-left">
      {/* Dashboard Welcome Header */}
      <div className="bg-white border border-brand-dark-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-maroon-700 text-white flex items-center justify-center font-display font-extrabold text-2xl shadow-premium">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-extrabold text-2xl text-brand-dark-900 leading-none">
              Welcome, {user?.name}
            </h1>
            <span className="font-sans text-xs text-brand-dark-500 font-semibold bg-brand-dark-50 border border-brand-dark-200 px-2 py-0.5 rounded capitalize">
              Role: {user?.role || 'Student'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Link to="/products" className="btn-secondary py-2.5 px-4 text-xs font-semibold flex-grow sm:flex-grow-0 text-center">
            Go Shopping
          </Link>
          <button 
            onClick={() => {
              dispatch(logout());
              toast.success('Logged out successfully');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors flex-grow sm:flex-grow-0"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* QUICK STATUS STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-brand-dark-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-brand-maroon-50 text-brand-maroon-700 rounded-xl">
            <ShoppingBag className="w-5.5 h-5.5" />
          </div>
          <div className="text-left">
            <span className="font-sans text-xs text-brand-dark-500 font-bold uppercase tracking-wider">Total Purchases</span>
            <p className="font-display font-extrabold text-xl text-brand-dark-950 mt-1">{orders.length} Orders</p>
          </div>
        </div>
        <div className="bg-white border border-brand-dark-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-brand-maroon-50 text-brand-maroon-700 rounded-xl">
            <MapPin className="w-5.5 h-5.5" />
          </div>
          <div className="text-left">
            <span className="font-sans text-xs text-brand-dark-500 font-bold uppercase tracking-wider">Saved Locations</span>
            <p className="font-display font-extrabold text-xl text-brand-dark-950 mt-1">{user?.addresses?.length || 0} Addresses</p>
          </div>
        </div>
        <div className="bg-white border border-brand-dark-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-brand-maroon-50 text-brand-maroon-700 rounded-xl">
            <Shield className="w-5.5 h-5.5" />
          </div>
          <div className="text-left">
            <span className="font-sans text-xs text-brand-dark-500 font-bold uppercase tracking-wider">Account Email</span>
            <p className="font-sans font-bold text-sm text-brand-dark-800 mt-1 truncate max-w-[200px]">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* TABS VIEWPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 bg-white border border-brand-dark-100 rounded-2xl p-4 shadow-sm h-fit">
          <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-thin">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-sans text-xs font-bold tracking-wider uppercase transition-colors shrink-0 text-left w-full ${
                activeTab === 'orders' 
                  ? 'bg-brand-maroon-700 text-white' 
                  : 'text-brand-dark-700 hover:bg-brand-maroon-50/50 hover:text-brand-maroon-700'
              }`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              Order History
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-sans text-xs font-bold tracking-wider uppercase transition-colors shrink-0 text-left w-full ${
                activeTab === 'addresses' 
                  ? 'bg-brand-maroon-700 text-white' 
                  : 'text-brand-dark-700 hover:bg-brand-maroon-50/50 hover:text-brand-maroon-700'
              }`}
            >
              <MapPin className="w-4.5 h-4.5" />
              Manage Locations
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-sans text-xs font-bold tracking-wider uppercase transition-colors shrink-0 text-left w-full ${
                activeTab === 'profile' 
                  ? 'bg-brand-maroon-700 text-white' 
                  : 'text-brand-dark-700 hover:bg-brand-maroon-50/50 hover:text-brand-maroon-700'
              }`}
            >
              <User className="w-4.5 h-4.5" />
              Member Profile
            </button>
          </div>
        </aside>

        {/* Tab Detail Viewport */}
        <main className="lg:col-span-3">
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-brand-dark-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="font-display font-bold text-xl text-brand-dark-900 border-b border-brand-dark-100 pb-3">
                Your Purchases
              </h2>

              {ordersLoading ? (
                <Loader />
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-brand-dark-500 font-sans text-sm">
                  You haven't placed any merchandise orders yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div 
                      key={ord._id}
                      className="border border-brand-dark-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-dark-350 transition-colors"
                    >
                      <div className="text-left space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-display font-extrabold text-sm text-brand-dark-900">
                            Order #{ord._id}
                          </span>
                          <span className={`px-2.5 py-0.5 border text-[10px] font-sans font-bold uppercase rounded-md ${getStatusColor(ord.status)}`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-brand-dark-550 truncate max-w-sm">
                          {ord.items.map(i => `${i.name} (${i.size})`).join(', ')}
                        </p>
                        <p className="font-sans text-[11px] text-brand-dark-400">
                          Placed on: {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                        <span className="font-sans font-black text-base text-brand-dark-950 mr-1">
                          ₹{ord.totalAmount?.toLocaleString('en-IN')}.00
                        </span>
                        
                        <Link 
                          to={`/order-confirm/${ord._id}`}
                          className="p-2.5 bg-brand-maroon-50 text-brand-maroon-700 hover:bg-brand-maroon-700 hover:text-white rounded-xl transition-all duration-200 border border-brand-maroon-100 flex items-center gap-1.5 font-sans text-xs font-semibold"
                          title="Track Live Order Status"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden md:inline">Track</span>
                        </Link>
                        <Link 
                          to={`/order/${ord._id}/receipt`}
                          className="p-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-700 hover:text-white rounded-xl transition-all duration-200 border border-indigo-100 flex items-center gap-1.5 font-sans text-xs font-semibold"
                          title="View Official Receipt"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden md:inline">Receipt</span>
                        </Link>

                        <button 
                          onClick={() => downloadReceipt(ord)}
                          className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white rounded-xl transition-all duration-200 border border-emerald-100 flex items-center gap-1.5 font-sans text-xs font-semibold"
                          title="Download PDF/Print Receipt"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden md:inline">Download</span>
                        </button>
                        {['placed', 'packed'].includes(ord.status?.toLowerCase()) && (
                          <button
                            onClick={() => { setCancelOrderId(ord._id); setCancelReason(''); }}
                            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 border border-red-100 flex items-center gap-1.5 font-sans text-xs font-semibold"
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4" />
                            <span className="hidden md:inline">Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white border border-brand-dark-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-brand-dark-100 pb-3">
                <h2 className="font-display font-bold text-xl text-brand-dark-900">
                  Delivery Locations
                </h2>
                {!showAddressForm && (
                  <button 
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-maroon-700 text-white font-sans font-semibold text-xs rounded-xl shadow-sm hover:bg-brand-maroon-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </button>
                )}
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="border border-brand-dark-200 p-5 rounded-2xl bg-brand-dark-50 space-y-4 animate-fadeIn">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-dark-750">New Location Details</h3>
                  
                  {/* Street */}
                  <div>
                    <label className="block text-xxs font-bold text-brand-dark-700 uppercase tracking-wider mb-1">Address / Hostel / Room</label>
                    <input
                      type="text"
                      className="input-field text-xs py-2 px-3 bg-white"
                      placeholder="Room 408, Girls Hostel B, Geeta University"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* City */}
                    <div>
                      <label className="block text-xxs font-bold text-brand-dark-700 uppercase tracking-wider mb-1">City</label>
                      <input
                        type="text"
                        className="input-field text-xs py-2 px-3 bg-white"
                        placeholder="Panipat"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    {/* State */}
                    <div>
                      <label className="block text-xxs font-bold text-brand-dark-700 uppercase tracking-wider mb-1">State</label>
                      <input
                        type="text"
                        className="input-field text-xs py-2 px-3 bg-white"
                        placeholder="Haryana"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                      />
                    </div>
                    {/* Pincode */}
                    <div>
                      <label className="block text-xxs font-bold text-brand-dark-700 uppercase tracking-wider mb-1">Pincode</label>
                      <input
                        type="text"
                        className="input-field text-xs py-2 px-3 bg-white"
                        placeholder="132145"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="btn-secondary py-2 px-4 text-xs font-semibold bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary py-2 px-5 text-xs font-semibold"
                    >
                      Save Location
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Address Cards */}
              {user?.addresses?.length === 0 ? (
                <div className="text-center py-6 text-brand-dark-500 font-sans text-sm">
                  No addresses saved yet. Click Add New to save one.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user?.addresses?.map((addr) => (
                    <div 
                      key={addr._id}
                      className="p-4 border border-brand-dark-250 rounded-2xl text-left space-y-2 relative"
                    >
                      <span className="font-sans font-bold text-sm text-brand-dark-900">
                        {addr.street.split(', ').pop() || 'Address'}
                      </span>
                      <p className="font-sans text-xs text-brand-dark-600 leading-relaxed">
                        {addr.street.split(',').slice(0, -1).join(',')}<br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      
                      {addr.isDefault && (
                        <span className="inline-block px-2 py-0.5 bg-brand-gold-100 border border-brand-gold-250 text-brand-gold-800 font-sans font-extrabold text-[8px] tracking-wider rounded uppercase mt-2">
                          Default Shipping
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEMBER PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-brand-dark-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="font-display font-bold text-xl text-brand-dark-900 border-b border-brand-dark-100 pb-3">
                Member Profile Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-sans text-brand-dark-600">
                <div className="space-y-1">
                  <span className="font-bold text-brand-dark-400 uppercase tracking-wider text-xxs block">Full Name</span>
                  <p className="text-brand-dark-900 font-semibold text-base">{user?.name}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="font-bold text-brand-dark-400 uppercase tracking-wider text-xxs block">Email Address</span>
                  <p className="text-brand-dark-900 font-semibold text-base">{user?.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-brand-dark-400 uppercase tracking-wider text-xxs block">Account Status</span>
                  <p className="text-green-700 font-bold text-base flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-green-600 rounded-full inline-block animate-pulse"></span>
                    Verified GU Member
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-brand-dark-400 uppercase tracking-wider text-xxs block">Membership Access</span>
                  <p className="text-brand-dark-900 font-semibold text-base capitalize">{user?.role} Portal</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Cancel Order Confirmation Modal ─────────────────────────────── */}
      {cancelOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark-950/40 backdrop-blur-md animate-fadeIn">
          <div 
            className="absolute inset-0"
            onClick={() => { setCancelOrderId(null); setCancelReason(''); }}
          />
          <div className="relative bg-white border border-brand-dark-100 rounded-3xl p-6 sm:p-8 shadow-xl w-full max-w-md z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-50 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-brand-dark-900">Cancel Order?</h3>
                <p className="font-sans text-xs text-brand-dark-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="font-sans text-sm text-brand-dark-600 mb-4">
              Are you sure you want to cancel this order? Your items will be restocked and no charge will be made.
            </p>

            <div className="mb-5">
              <label className="font-sans text-xs font-bold uppercase tracking-wider text-brand-dark-500 block mb-1.5">
                Reason for Cancellation <span className="text-brand-dark-400 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Ordered by mistake, found a better deal..."
                rows={3}
                className="w-full border border-brand-dark-200 rounded-xl px-4 py-2.5 font-sans text-sm text-brand-dark-800 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setCancelOrderId(null); setCancelReason(''); }}
                className="flex-1 py-3 border border-brand-dark-200 text-brand-dark-700 hover:bg-brand-dark-50 rounded-xl font-sans text-sm font-semibold transition-all"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-sans text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Cancelling...</>
                ) : (
                  <><XCircle className="w-4 h-4" />Yes, Cancel Order</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
