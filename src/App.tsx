import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Mapa } from './pages/Mapa';
import { Locais } from './pages/Locais';
import { Voluntarios } from './pages/Voluntarios';
import { Relatorios } from './pages/Relatorios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/mapa"
            element={
              <PrivateRoute>
                <Layout>
                  <Mapa />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/locais"
            element={
              <PrivateRoute>
                <Layout>
                  <Locais />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/voluntarios"
            element={
              <PrivateRoute>
                <Layout>
                  <Voluntarios />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/relatorios"
            element={
              <PrivateRoute>
                <Layout>
                  <Relatorios />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
