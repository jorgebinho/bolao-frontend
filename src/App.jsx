// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RankingPage from './pages/RankingPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas protegidas com layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Notificações toast estilo neobrut */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0A0A0A',
            color: '#FFE600',
            border: '3px solid #0A0A0A',
            borderRadius: '0',
            fontFamily: '"Space Grotesk", monospace',
            fontWeight: 'bold',
            fontSize: '13px',
            boxShadow: '4px 4px 0px 0px #FFE600',
          },
          success: {
            style: {
              background: '#00FF85',
              color: '#0A0A0A',
              boxShadow: '4px 4px 0px 0px #0A0A0A',
            },
          },
          error: {
            style: {
              background: '#FF2D2D',
              color: '#FAFAFA',
              boxShadow: '4px 4px 0px 0px #0A0A0A',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
