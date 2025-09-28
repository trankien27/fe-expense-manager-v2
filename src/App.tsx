import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Header from './components/Header';
import TransactionPage from './components/transaction/TransactionPage';
import WalletPage from './components/wallet/WalletPage';
import CategoryPage from './components/category/CategoryPage'; // 👈 thêm import

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/transaction" 
            element={
              <ProtectedRoute>
                <TransactionPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/wallets" 
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/categories"     // 👈 thêm route danh mục
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
