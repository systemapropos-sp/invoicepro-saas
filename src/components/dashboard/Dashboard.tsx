import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '@/contexts/BusinessContext';
import { Invoice } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  FileText, 
  Users, 
  ClipboardList,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, isAfter, parseISO, isBefore } from 'date-fns';

interface ChartDataPoint {
  name: string;
  revenue: number;
}

export function Dashboard() {
  const { t } = useTranslation();
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();

  // Calculate stats from current business invoices
  const stats = useMemo(() => {
    const invoices = currentBusiness.invoices;
    const now = new Date();
    
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'viewed')
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const invoiceCounts = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total_invoices: totalInvoiced,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      overdue_amount: overdueAmount,
      invoice_counts: invoiceCounts,
      total_clients: currentBusiness.clients.length,
      total_estimates: currentBusiness.estimates.length,
    };
  }, [currentBusiness]);

  // Get recent invoices (last 5)
  const recentInvoices = useMemo(() => {
    return [...currentBusiness.invoices]
      .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime())
      .slice(0, 5);
  }, [currentBusiness.invoices]);

  // Generate chart data from last 6 months
  const chartData: ChartDataPoint[] = useMemo(() => {
    const months: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthRevenue = currentBusiness.invoices
        .filter(inv => {
          const invDate = parseISO(inv.issue_date);
          return inv.status === 'paid' && isAfter(invDate, monthStart) && isBefore(invDate, monthEnd);
        })
        .reduce((sum, inv) => sum + inv.total, 0);
      
      months.push({
        name: format(monthDate, 'MMM'),
        revenue: monthRevenue
      });
    }
    
    return months;
  }, [currentBusiness.invoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentBusiness.currency || 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      viewed: 'bg-purple-100 text-purple-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-500'
    };
    return styles[status] || styles.draft;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1f1f1f]">{t('dashboard.title')}</h1>
            <p className="text-[#5d6c7b] mt-1">{t('dashboard.welcome', { business: currentBusiness.name })}</p>
          </div>
        </div>
        <Button 
          className="bg-[#0082f3] hover:bg-[#2895f7]"
          onClick={() => navigate('/invoices/new')}
        >
          <FileText className="w-4 h-4 mr-2" />
          {t('dashboard.createInvoice')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5d6c7b]">{t('dashboard.totalInvoiced')}</p>
                <p className="text-2xl font-bold text-[#1f1f1f] mt-1">
                  {formatCurrency(stats.total_invoices)}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#0082f3]/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#0082f3]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5d6c7b]">{t('dashboard.paid')}</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(stats.paid_amount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5d6c7b]">{t('dashboard.pending')}</p>
                <p className="text-2xl font-bold text-orange-500 mt-1">
                  {formatCurrency(stats.pending_amount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5d6c7b]">{t('dashboard.overdue')}</p>
                <p className="text-2xl font-bold text-red-500 mt-1">
                  {formatCurrency(stats.overdue_amount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('dashboard.revenueOverview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9e9e9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#5d6c7b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#5d6c7b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e9e9e9',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0082f3" 
                    strokeWidth={2}
                    dot={{ fill: '#0082f3', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: '#0082f3', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('dashboard.invoiceStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.invoice_counts).length > 0 ? (
                Object.entries(stats.invoice_counts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        status === 'paid' ? 'bg-green-500' :
                        status === 'overdue' ? 'bg-red-500' :
                        status === 'sent' ? 'bg-blue-500' :
                        status === 'viewed' ? 'bg-purple-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="text-sm text-[#464646] capitalize">{t(`status.${status}`, status)}</span>
                    </div>
                    <span className="text-sm font-medium text-[#1f1f1f]">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#5d6c7b]">{t('invoices.noInvoices')}</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => navigate('/clients')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0082f3]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#0082f3]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1f1f1f]">{stats.total_clients}</p>
                    <p className="text-xs text-[#5d6c7b]">{t('dashboard.clients')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => navigate('/estimates')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1f1f1f]">{stats.total_estimates}</p>
                    <p className="text-xs text-[#5d6c7b]">{t('dashboard.estimates')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">{t('dashboard.recentInvoices')}</CardTitle>
          <Link to="/invoices">
            <Button variant="ghost" size="sm" className="text-[#0082f3]">
              {t('dashboard.viewAll')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e9e9e9]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#5d6c7b]">{t('invoices.invoiceNumber')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#5d6c7b]">{t('invoices.client')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#5d6c7b]">{t('common.date')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#5d6c7b]">{t('common.status')}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#5d6c7b]">{t('common.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5d6c7b]">
                      {t('invoices.createFirst')}
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice) => (
                    <tr 
                      key={invoice.id} 
                      className="border-b border-[#e9e9e9] hover:bg-[#fafafa] cursor-pointer"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      <td className="py-4 px-4 text-sm font-medium text-[#1f1f1f]">
                        {invoice.invoice_number}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#464646]">
                        {invoice.client_name}
                      </td>
                      <td className="py-4 px-4 text-sm text-[#5d6c7b]">
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusBadge(invoice.status)}>
                          {t(`status.${invoice.status}`, invoice.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-[#1f1f1f] text-right">
                        {formatCurrency(invoice.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
