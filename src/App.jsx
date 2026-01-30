import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Lazy load the Dashboard and other protected pages
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Favorites = lazy(() => import('./pages/Favorites.jsx'));
const Compare = lazy(() => import('./pages/Compare.jsx'));
const Recognize = lazy(() => import('./pages/Recognize.jsx'));
const Personalize = lazy(() => import('./pages/Personalize.jsx'));

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

// Animated page wrapper component
const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
    >
      {children}
    </motion.div>
  );
};

// Custom loading fallback
const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-primary-100 rounded-full mx-auto"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary-600 rounded-full border-t-transparent animate-spin mx-auto"></div>
        </div>
        <p className="text-dark-500 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="pt-16">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <AnimatedPage>
                  <Home />
                </AnimatedPage>
              }
            />
            <Route
              path="/sign-in"
              element={
                <AnimatedPage>
                  <SignInPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/sign-up"
              element={
                <AnimatedPage>
                  <SignUpPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AnimatedPage>
                      <Dashboard />
                    </AnimatedPage>
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AnimatedPage>
                      <Favorites />
                    </AnimatedPage>
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/compare"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AnimatedPage>
                      <Compare />
                    </AnimatedPage>
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recognize"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AnimatedPage>
                      <Recognize />
                    </AnimatedPage>
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/personalize"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AnimatedPage>
                      <Personalize />
                    </AnimatedPage>
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

