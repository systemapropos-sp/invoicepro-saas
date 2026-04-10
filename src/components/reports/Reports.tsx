import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText,
  Loader2,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const COLORS = ['#0082f3', '#4ade80', '#fb923c', '#f87171', '#8b5cf6', '#c8c8c8'];

export function Reports() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [yearlySummary, setYearlySummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchApi } = useApi();

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const [revenueRes, statusRes, clientsRes, summaryRes] = await Promise.all([
          fetchApi<{ success: boolean; data: any[] }>(`/reports/index.php?type=revenue&year=${year}`),
          fetchApi<{ success: boolean; data: any[] }>(`/reports/index.php?type=invoice-status`),
          fetchApi<{ success: boolean; data: any[] }>(`/reports/index.php?type=top-clients&limit=5`),
          fetchApi<{ success: boolean; data: any }>(`/reports/index.php?type=yearly-summary&year=${year}`)
        ]);

        if (revenueRes.success) setRevenueData(revenueRes.data);
        if (statusRes.success) setStatusData(statusRes.data);
        if (clientsRes.success) setTopClients(clientsRes.data);
        if (summaryRes.success) setYearlySummary(summaryRes.data);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, [year]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0082f3]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1f1f1f]">Reports & Analytics</h1>
          <p className="text-[#5d6c7b] mt-1">Track your business performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {yearlySummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5d6c7b]">Total Invoiced</p>
                  <p className="text-2xl font-bold text-[#1f1f1f] mt-1">
                    {formatCurrency(yearlySummary.invoices?.total || 0)}
                  </p>
                  <p className="text-xs text-[#aaadb0] mt-1">
                    {yearlySummary.invoices?.count || 0} invoices
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#0082f3]/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#0082f3]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5d6c7b]">Revenue Collected</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(yearlySummary.paid_amount || 0)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {yearlySummary.invoices?.total > 0 
                      ? Math.round((yearlySummary.paid_amount / yearlySummary.invoices.total) * 100) 
                      : 0}% collection rate
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5d6c7b]">Total Estimates</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {formatCurrency(yearlySummary.estimates?.total || 0)}
                  </p>
                  <p className="text-xs text-[#aaadb0] mt-1">
                    {yearlySummary.estimates?.count || 0} estimates
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5d6c7b]">New Clients</p>
                  <p className="text-2xl font-bold text-orange-500 mt-1">
                    {yearlySummary.new_clients || 0}
                  </p>
                  <p className="text-xs text-[#aaadb0] mt-1">
                    this year
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9e9e9" />
                  <XAxis 
                    dataKey="month" 
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
                    dataKey="paid" 
                    name="Paid"
                    stroke="#4ade80" 
                    strokeWidth={2}
                    dot={{ fill: '#4ade80', strokeWidth: 0, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    name="Pending"
                    stroke="#fb923c" 
                    strokeWidth={2}
                    dot={{ fill: '#fb923c', strokeWidth: 0, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Invoice Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value} invoices`, name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e9e9e9',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusData.map((entry, index) => (
                <div key={entry.status} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-[#464646] capitalize">{entry.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topClients} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e9e9e9" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#5d6c7b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  stroke="#5d6c7b"
                  fontSize={12}
                  tickLine={false}
                  width={150}
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
                <Bar 
                  dataKey="total_revenue" 
                  fill="#0082f3" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
