import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingBag,
  Users,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  X,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
} from 'lucide-react';
import {
  fetchAnalyticsSummary,
  fetchRevenueAnalytics,
  fetchTopProductsAnalytics,
} from '../../features/admin/adminSlice';
import { downloadReceipt } from '../../utils/receiptGenerator';
import api from '../../utils/api';

const PERIOD_OPTIONS = [
  { label: 'Week', period: 'week', groupBy: 'day' },
  { label: 'Month', period: 'month', groupBy: 'day' },
  { label: 'Quarter', period: 'quarter', groupBy: 'week' },
  { label: 'Year', period: 'year', groupBy: 'month' },
];

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((state) => state.admin);
  const [activePeriod, setActivePeriod] = useState(PERIOD_OPTIONS[1]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // States for Users and Purchase History Modal
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsersAndOrders = async () => {
    setUsersLoading(true);
    try {
      const [usersRes, ordersRes] = await Promise.all([
        api.get('/auth/admin/users'),
        api.get('/orders/admin/all', { params: { limit: 1000 } })
      ]);
      if (usersRes.data?.success) {
        setUsersList(usersRes.data.users || []);
      }
      if (ordersRes.data?.success) {
        setAllOrders(ordersRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load users or orders', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadAnalytics = useCallback(() => {
    dispatch(fetchAnalyticsSummary());
    dispatch(fetchRevenueAnalytics({
      period: activePeriod.period,
      groupBy: activePeriod.groupBy,
    }));
    dispatch(fetchTopProductsAnalytics());
    setLastUpdated(new Date());
  }, [dispatch, activePeriod]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    const interval = setInterval(loadAnalytics, 60000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const summary = analytics.summary;
  const revenueData = analytics.revenue?.periods || [];
  const topProducts = analytics.topProducts || [];

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  const formatPeriodLabel = (period) => {
    if (!period) return '';
    if (period.includes('W')) return period.replace('W', ' Wk ');
    if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
      return new Date(period).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
    if (/^\d{4}-\d{2}$/.test(period)) {
      const [year, month] = period.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    }
    return period;
  };

  const isInitialLoading = (loading.analyticsSummary || loading.analyticsRevenue || loading.analyticsTopProducts) && !summary;
  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
        <span className="font-sans text-sm text-white/50 font-medium">Loading dashboard statistics...</span>
      </div>
    );
  }

  if (error.analytics && !summary) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-6 rounded-2xl text-center max-w-xl mx-auto mt-10">
        <h4 className="font-display font-bold text-base">Analytics Fetch Failure</h4>
        <p className="font-sans text-sm mt-1">{error.analytics}</p>
        <button onClick={loadAnalytics} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm font-semibold transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const renderRevenueChart = () => {
    if (!revenueData || revenueData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-white/40 font-sans text-sm gap-2">
          <DollarSign className="w-8 h-8 text-white/20" />
          No revenue data for this period yet.
        </div>
      );
    }

    const width = 800;
    const height = 280;
    const padding = 50;

    const revenues = revenueData.map((d) => d.revenue);
    const maxRevenue = Math.max(...revenues, 1000) * 1.15;

    const getX = (index) => {
      if (revenueData.length <= 1) return width / 2;
      return padding + (index * (width - padding * 2)) / (revenueData.length - 1);
    };

    const getY = (value) =>
      height - padding - (value * (height - padding * 2)) / maxRevenue;

    let pathD = '';
    let areaD = '';

    revenueData.forEach((d, idx) => {
      const x = getX(idx);
      const y = getY(d.revenue);
      if (idx === 0) {
        pathD = `M ${x} ${y}`;
        areaD = `M ${x} ${height - padding} L ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
        areaD += ` L ${x} ${y}`;
      }
      if (idx === revenueData.length - 1) {
        areaD += ` L ${x} ${height - padding} Z`;
      }
    });

    return (
      <div className="relative w-full overflow-x-auto scrollbar-thin">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px] overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9c2637" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const val = maxRevenue * ratio;
            const y = getY(val);
            return (
              <g key={idx} className="opacity-30">
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#ffffff"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  opacity="0.15"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="font-sans text-[10px] fill-white/40 font-medium"
                >
                  {formatCurrency(val)}
                </text>
              </g>
            );
          })}

          {revenueData.map((d, idx) => {
            const x = getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={height - 12}
                textAnchor="middle"
                className="font-sans text-[10px] fill-white/50 font-medium"
              >
                {formatPeriodLabel(d.period)}
              </text>
            );
          })}

          {revenueData.length > 0 && <path d={areaD} fill="url(#areaGrad)" />}
          {revenueData.length > 0 && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {revenueData.map((d, idx) => {
            const x = getX(idx);
            const y = getY(d.revenue);
            return (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  className="fill-[#d4af37] stroke-[#9c2637] stroke-[2]"
                />
                <title>{`${formatPeriodLabel(d.period)}: ${formatCurrency(d.revenue)} (${d.orderCount} orders)`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderTopProductsChart = () => {
    if (!topProducts || topProducts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-white/40 font-sans text-sm gap-2">
          <ShoppingBag className="w-8 h-8 text-white/20" />
          No sales data recorded yet.
        </div>
      );
    }

    const maxQty = Math.max(...topProducts.map((p) => p.totalQtySold), 1);

    return (
      <div className="space-y-5 pt-2">
        {topProducts.slice(0, 5).map((prod, idx) => {
          const percent = (prod.totalQtySold / maxQty) * 100;
          return (
            <div key={prod.productId || idx} className="space-y-2 font-sans">
              <div className="flex justify-between items-center text-xs gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-white/90 truncate">{prod.productName}</span>
                </div>
                <span className="font-medium text-white/50 flex-shrink-0">
                  <span className="text-[#d4af37] font-bold">{prod.totalQtySold}</span> sold
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#9c2637] to-[#d4af37] rounded-full transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-[10px] text-white/30">{formatCurrency(prod.totalRevenue)} revenue</p>
            </div>
          );
        })}
      </div>
    );
  };

  const getTrendIcon = (change) =>
    change > 0
      ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
      : <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />;

  const getTrendBadgeClass = (change) =>
    change > 0
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  const statCards = [
    {
      label: 'All-Time Revenue',
      value: summary ? formatCurrency(summary.revenue.allTime) : '₹0',
      icon: DollarSign,
      iconBg: 'bg-[#9c2637]/20 border-[#9c2637]/30 text-[#d4af37]',
      trend: summary?.revenue.monthlyChange,
      trendLabel: 'vs last month',
    },
    {
      label: 'Total Orders',
      value: summary ? summary.orders.total : '0',
      icon: ShoppingBag,
      iconBg: 'bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]',
      trend: summary?.orders.monthlyChange,
      trendLabel: 'vs last month',
    },
    {
      label: 'Total Users',
      value: summary ? summary.users.total : '0',
      icon: Users,
      iconBg: 'bg-white/5 border-white/10 text-white/60',
      extra: summary ? `+${summary.users.newThisMonth} new this month` : null,
    },
    {
      label: 'Pending Actions',
      value: summary ? summary.orders.pending : '0',
      icon: Activity,
      iconBg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      extra: summary ? `${summary.orders.pending} awaiting dispatch` : null,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-white/40 font-medium">
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
              : 'Loading...'}
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          disabled={loading.analyticsSummary || loading.analyticsRevenue || loading.analyticsTopProducts}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(loading.analyticsSummary || loading.analyticsRevenue || loading.analyticsTopProducts) ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isUsersCard = card.label === 'Total Users';
          return (
            <div
              key={card.label}
              onClick={isUsersCard ? () => { setUsersModalOpen(true); fetchUsersAndOrders(); } : undefined}
              className={`bg-[#12081a]/80 border border-white/5 p-5 rounded-2xl hover:border-[#d4af37]/20 transition-all duration-300 ${
                isUsersCard ? 'cursor-pointer hover:bg-[#1e102d] hover:scale-[1.01]' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{card.label}</span>
                  <h3 className="font-display font-extrabold text-2xl text-white leading-none">{card.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              {card.trend !== undefined && (
                <div className="flex items-center gap-1.5 mt-4">
                  <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${getTrendBadgeClass(card.trend)}`}>
                    {getTrendIcon(card.trend)}
                    <span>{Math.abs(card.trend)}%</span>
                  </div>
                  <span className="text-[10px] text-white/30 font-medium">{card.trendLabel}</span>
                </div>
              )}
              {card.extra && (
                <p className="text-[10px] text-white/40 font-medium mt-4">{card.extra}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#12081a]/80 border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="font-display font-bold text-base text-white">Revenue Performance</h3>
              <p className="font-sans text-xs text-white/40 mt-0.5">Gross sales from paid orders</p>
            </div>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setActivePeriod(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePeriod.label === opt.label
                      ? 'bg-[#9c2637] text-white shadow-sm'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {loading.analyticsRevenue ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
            </div>
          ) : (
            renderRevenueChart()
          )}
        </div>

        <div className="bg-[#12081a]/80 border border-white/5 p-6 rounded-2xl space-y-5 flex flex-col">
          <div>
            <h3 className="font-display font-bold text-base text-white">Top 5 Products</h3>
            <p className="font-sans text-xs text-white/40 mt-0.5">Best sellers by volume (all-time)</p>
          </div>
          <div className="flex-1">
            {loading.analyticsTopProducts ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin" />
              </div>
            ) : (
              renderTopProductsChart()
            )}
          </div>
        </div>
      </div>

      {/* Users & Purchase History Modal */}
      {usersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div 
            onClick={() => setUsersModalOpen(false)} 
            className="absolute inset-0"
          />
          <div className="relative bg-[#12081a] border border-[#d4af37]/20 rounded-3xl p-6 sm:p-8 shadow-premium w-full max-w-4xl max-h-[85vh] z-10 flex flex-col animate-slideUp text-left">
            <button 
              onClick={() => setUsersModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="font-display font-extrabold text-xl text-white">
                Registered Users & Purchase History
              </h3>
              <p className="font-sans text-xs text-white/40 mt-1">
                Monitor student & faculty accounts, view delivery details, and track individual order histories.
              </p>
            </div>

            {/* Search filter */}
            <div className="relative mb-5">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/60 transition-all font-sans"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Scrollable list content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
              {usersLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
                  <span className="text-xs text-white/40 font-medium font-sans">Fetching account details...</span>
                </div>
              ) : (
                (() => {
                  const filteredUsers = usersList.filter(user => 
                    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  if (filteredUsers.length === 0) {
                    return (
                      <div className="text-center py-12 text-white/40 text-sm font-sans">
                        No users found matching your search.
                      </div>
                    );
                  }

                  const getUserOrders = (userId) => {
                    return allOrders.filter(order => {
                      const orderUserId = typeof order.userId === 'object' && order.userId ? order.userId._id : order.userId;
                      return orderUserId === userId;
                    });
                  };

                  return filteredUsers.map((u) => {
                    const orders = getUserOrders(u._id);
                    const isExpanded = expandedUser === u._id;
                    
                    return (
                      <div 
                        key={u._id} 
                        className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                          isExpanded 
                            ? 'border-[#d4af37]/30 bg-[#1d102b]/60' 
                            : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                        }`}
                      >
                        {/* User Header Accordion Trigger */}
                        <div 
                          onClick={() => setExpandedUser(isExpanded ? null : u._id)}
                          className="p-4 sm:p-5 flex justify-between items-center cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-[#160c21] flex items-center justify-center font-display font-extrabold text-sm text-[#d4af37] shrink-0">
                              {u.name ? u.name[0].toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-display font-bold text-sm text-white truncate">{u.name}</h4>
                              <span className="font-sans text-[11px] text-white/40 truncate block">{u.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`px-2 py-0.5 border text-[9px] font-sans font-bold uppercase tracking-wider rounded-md ${
                              u.role === 'admin' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                : u.role === 'faculty' 
                                ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {u.role}
                            </span>
                            <span className="text-[10px] text-white/30 font-medium font-sans">
                              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                          </div>
                        </div>

                        {/* User Expanded Body */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 pt-0 border-t border-white/5 grid grid-cols-1 md:grid-cols-12 gap-5 text-xs font-sans">
                            {/* Left: Contact Info & Addresses (md:col-span-5) */}
                            <div className="md:col-span-5 space-y-4">
                              <div>
                                <h5 className="font-bold text-[10px] uppercase tracking-wider text-white/40 mb-2">Account Profile</h5>
                                <div className="space-y-1.5 text-white/70">
                                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-white/30" /> {u.email}</p>
                                  {u.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-white/30" /> {u.phone}</p>}
                                </div>
                              </div>

                              <div>
                                <h5 className="font-bold text-[10px] uppercase tracking-wider text-white/40 mb-2">Saved Addresses</h5>
                                {!u.addresses || u.addresses.length === 0 ? (
                                  <p className="text-white/30 italic">No addresses saved</p>
                                ) : (
                                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                    {u.addresses.map((addr, idx) => (
                                      <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 leading-relaxed text-white/70">
                                        <p className="font-semibold text-[#d4af37] text-[11px]">{addr.fullName} {addr.isDefault && <span className="text-[9px] uppercase font-bold text-white/40 border border-white/10 px-1 rounded ml-1 bg-white/5">Default</span>}</p>
                                        <p className="mt-0.5">{addr.street}</p>
                                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                        {addr.phone && <p className="text-[10px] text-white/40 mt-0.5">Ph: {addr.phone}</p>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Purchase History (md:col-span-7) */}
                            <div className="md:col-span-7 space-y-3">
                              <h5 className="font-bold text-[10px] uppercase tracking-wider text-white/40">Order History</h5>
                              {orders.length === 0 ? (
                                <p className="text-white/30 italic">This user hasn't placed any orders yet.</p>
                              ) : (
                                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                                  {orders.map((ord) => {
                                    const isDeliveredAndPaid = ord.status?.toLowerCase() === 'delivered' && ord.paymentStatus?.toLowerCase() === 'paid';
                                    
                                    return (
                                      <div key={ord._id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors flex justify-between items-center gap-3">
                                        <div className="space-y-1 text-left min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-[#d4af37] font-mono text-[11px]">#{ord._id.slice(-6).toUpperCase()}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                              ord.status === 'delivered' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : ord.status === 'shipped' 
                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            }`}>
                                              {ord.status}
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                              ord.paymentStatus === 'paid' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                              {ord.paymentStatus || 'Pending'}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-white/50 truncate max-w-xs">
                                            {ord.items?.map(i => `${i.name} (${i.size}x${i.qty})`).join(', ')}
                                          </p>
                                          <p className="text-[9px] text-white/30">
                                            {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                          </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                          <span className="font-bold text-white">₹{ord.totalAmount?.toLocaleString('en-IN')}.00</span>
                                          {isDeliveredAndPaid && (
                                            <button
                                              onClick={() => downloadReceipt(ord)}
                                              className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg border border-emerald-500/20 text-[9px] font-bold transition-all"
                                              title="Download Receipt"
                                            >
                                              <Download className="w-2.5 h-2.5" />
                                              Receipt
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
