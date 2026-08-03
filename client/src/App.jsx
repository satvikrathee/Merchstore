import React, { useEffect, lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Layout & Security
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoutes from './routes/AdminRoutes';
import Loader from './components/Loader';
import SplashScreen from './components/SplashScreen';

// Pages — Lazy loaded for fast initial render
const Home          = lazy(() => import('./pages/Home'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const ProductList   = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const OrderConfirm  = lazy(() => import('./pages/OrderConfirm'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const OAuthSuccess  = lazy(() => import('./pages/OAuthSuccess'));
const AdminDashboard= lazy(() => import('./pages/admin/AdminDashboard'));
const OrderReceipt  = lazy(() => import('./pages/OrderReceipt'));
const Settings      = lazy(() => import('./pages/Settings'));

// State Actions
import { fetchCurrentUser } from './features/auth/authSlice';

const toastOptions = {
  position: 'bottom-right',
  toastOptions: {
    duration: 3500,
    style: {
      background: '#0F172A',
      color: '#F8FAFC',
      borderRadius: '12px',
      fontSize: '13px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: '500',
      padding: '12px 18px',
      boxShadow: '0 10px 30px -10px rgba(105, 18, 44, 0.15)',
    },
    success: {
      iconTheme: {
        primary: '#D4AF37',
        secondary: '#0F172A',
      },
    },
  },
};

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/register', '/oauth-success'].includes(location.pathname);
  const showPublicChrome = !isAdminRoute;

  return (
    <div className={`flex flex-col ${isAdminRoute ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-brand-dark-50 text-brand-dark-800 font-sans`}>
      <Toaster {...toastOptions} />

      {showPublicChrome && <Navbar />}

      <main className={isAdminRoute ? 'flex-1 min-h-0 overflow-hidden' : 'flex-grow'}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirm/:orderId"
              element={
                <ProtectedRoute>
                  <OrderConfirm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order/:orderId/receipt"
              element={
                <ProtectedRoute>
                  <OrderReceipt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <AdminRoutes>
                  <AdminDashboard />
                </AdminRoutes>
              }
            />

            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>

      {showPublicChrome && !isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  const handleSplashDone = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <Router>
        <AppLayout />
      </Router>
    </>
  );
}

export default App;
