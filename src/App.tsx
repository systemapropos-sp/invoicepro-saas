import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { BusinessProvider } from '@/contexts/BusinessContext';
import { AuthPage } from '@/components/auth/AuthPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { InvoiceDetail } from '@/components/invoices/InvoiceDetail';
import { ClientList } from '@/components/clients/ClientList';
import { ClientForm } from '@/components/clients/ClientForm';
import { ClientDetail } from '@/components/clients/ClientDetail';
import { EstimateList } from '@/components/estimates/EstimateList';
import { EstimateForm } from '@/components/estimates/EstimateForm';
import { VendorList } from '@/components/vendors/VendorList';
import { VendorForm } from '@/components/vendors/VendorForm';
import { Reports } from '@/components/reports/Reports';
import { Settings } from '@/components/settings/Settings';
import { Tools } from '@/components/tools/Tools';
import { Expenses } from '@/components/expenses/Expenses';
import { Toaster } from '@/components/ui/sonner';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-[#0082f3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-[#0082f3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } 
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <PrivateRoute>
            <MainLayout>
              <InvoiceList />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/invoices/new"
        element={
          <PrivateRoute>
            <MainLayout>
              <InvoiceForm />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <InvoiceDetail />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/invoices/:id/edit"
        element={
          <PrivateRoute>
            <MainLayout>
              <InvoiceForm />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <PrivateRoute>
            <MainLayout>
              <ClientList />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/clients/new"
        element={
          <PrivateRoute>
            <MainLayout>
              <ClientForm />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <ClientDetail />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/clients/:id/edit"
        element={
          <PrivateRoute>
            <MainLayout>
              <ClientForm />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/estimates"
        element={
          <PrivateRoute>
            <MainLayout>
              <EstimateList />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/estimates/new"
        element={
          <PrivateRoute>
            <MainLayout>
              <EstimateForm />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/estimates/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <EstimateForm />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/estimates/:id/edit"
        element={
          <PrivateRoute>
            <MainLayout>
              <EstimateForm />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/vendors"
        element={
          <PrivateRoute>
            <MainLayout>
              <VendorList />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/vendors/new"
        element={
          <PrivateRoute>
            <MainLayout>
              <VendorForm />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/vendors/:id/edit"
        element={
          <PrivateRoute>
            <MainLayout>
              <VendorForm />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/tools"
        element={
          <PrivateRoute>
            <MainLayout>
              <Tools />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/tools/expenses"
        element={
          <PrivateRoute>
            <MainLayout>
              <Expenses />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <MainLayout>
              <Reports />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <HashRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </HashRouter>
      </BusinessProvider>
    </AuthProvider>
  );
}

export default App;
