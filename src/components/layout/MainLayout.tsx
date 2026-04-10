import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Wrench,
  Truck
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { currentBusiness } = useBusiness();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: t('common.dashboard'), icon: LayoutDashboard },
    { path: '/invoices', label: t('invoices.title'), icon: FileText },
    { path: '/estimates', label: t('estimates.title'), icon: ClipboardList },
    { path: '/clients', label: t('clients.title'), icon: Users },
    { path: '/vendors', label: t('vendors.title'), icon: Truck },
    { path: '/tools', label: t('common.tools', 'Tools'), icon: Wrench },
    { path: '/reports', label: t('common.reports', 'Reports'), icon: BarChart3 },
    { path: '/settings', label: t('settings.title'), icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#e9e9e9] fixed h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#e9e9e9]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0082f3] rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1f1f1f]">InvoicePro</span>
          </Link>
        </div>

        {/* Create Button */}
        <div className="p-4">
          <Button 
            className="w-full bg-[#0082f3] hover:bg-[#2895f7]"
            onClick={() => navigate('/invoices/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('dashboard.createInvoice')}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0082f3]/10 text-[#0082f3]'
                    : 'text-[#5d6c7b] hover:bg-[#f3f3f3] hover:text-[#1f1f1f]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Business & User */}
        <div className="p-4 border-t border-[#e9e9e9]">
          {/* Language Switcher */}
          <div className="mb-3">
            <LanguageSwitcher />
          </div>
          
          <div className="border-t border-[#e9e9e9] my-3" />
          
          {/* Current Business */}
          <Link to="/settings" className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0082f3] to-[#2895f7] rounded-lg flex items-center justify-center text-white font-medium text-sm">
              {currentBusiness.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1f1f1f] truncate">{currentBusiness.name}</p>
              <p className="text-xs text-[#0082f3] truncate">{t('settings.switchBusiness')}</p>
            </div>
          </Link>
          
          <div className="border-t border-[#e9e9e9] my-3" />
          
          {/* User */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1f1f1f] truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-[#aaadb0] truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('common.logout')}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e9e9e9] z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0082f3] rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#1f1f1f]">InvoicePro</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="h-16 flex items-center justify-end px-4 border-b border-[#e9e9e9]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#0082f3]/10 text-[#0082f3]'
                        : 'text-[#5d6c7b] hover:bg-[#f3f3f3]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#e9e9e9] space-y-3">
              <LanguageSwitcher />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('common.logout')}
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
