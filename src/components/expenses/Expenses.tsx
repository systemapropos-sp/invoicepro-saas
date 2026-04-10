import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  Plus,
  Receipt,
  Calendar,
  Store,
  Tag,
  DollarSign,
  FileText,
  Trash2,
  Search,
  ArrowLeft
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Expense {
  id: number;
  date: string;
  merchant: string;
  category: string;
  total: number;
  tax: number;
  description: string;
  receipt_url?: string;
}

const categories = [
  { value: 'meals', label: 'Meals', color: '#ef4444' },
  { value: 'car_rental', label: 'Car Rental', color: '#f97316' },
  { value: 'health', label: 'Health', color: '#22c55e' },
  { value: 'shipping', label: 'Shipping', color: '#3b82f6' },
  { value: 'travel', label: 'Travel', color: '#8b5cf6' },
  { value: 'office', label: 'Office Supplies', color: '#06b6d4' },
  { value: 'utilities', label: 'Utilities', color: '#f59e0b' },
  { value: 'other', label: 'Other', color: '#6b7280' },
];

const mockExpenses: Expense[] = [
  {
    id: 1,
    date: '2024-01-15',
    merchant: 'Starbucks',
    category: 'meals',
    total: 24.50,
    tax: 2.45,
    description: 'Client meeting coffee',
  },
  {
    id: 2,
    date: '2024-01-14',
    merchant: 'Hertz Car Rental',
    category: 'car_rental',
    total: 189.00,
    tax: 18.90,
    description: 'Business trip vehicle',
  },
  {
    id: 3,
    date: '2024-01-12',
    merchant: 'CVS Pharmacy',
    category: 'health',
    total: 45.67,
    tax: 4.57,
    description: 'Medical supplies',
  },
  {
    id: 4,
    date: '2024-01-10',
    merchant: 'FedEx',
    category: 'shipping',
    total: 32.15,
    tax: 3.22,
    description: 'Document shipping',
  },
  {
    id: 5,
    date: '2024-01-08',
    merchant: 'Delta Airlines',
    category: 'travel',
    total: 450.00,
    tax: 45.00,
    description: 'Conference flight',
  },
  {
    id: 6,
    date: '2024-01-05',
    merchant: 'Office Depot',
    category: 'office',
    total: 78.99,
    tax: 7.90,
    description: 'Printer paper and ink',
  },
  {
    id: 7,
    date: '2024-01-03',
    merchant: 'McDonald\'s',
    category: 'meals',
    total: 18.75,
    tax: 1.88,
    description: 'Lunch on the go',
  },
];

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    merchant: '',
    category: '',
    total: '',
    tax: '',
    description: '',
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || expense.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.total;
    });

    return categories
      .filter((cat) => categoryTotals[cat.value])
      .map((cat) => ({
        name: cat.label,
        value: categoryTotals[cat.value],
        color: cat.color,
      }));
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
  const totalTax = expenses.reduce((sum, e) => sum + e.tax, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: Date.now(),
      date: formData.date,
      merchant: formData.merchant,
      category: formData.category,
      total: parseFloat(formData.total) || 0,
      tax: parseFloat(formData.tax) || 0,
      description: formData.description,
    };
    setExpenses([newExpense, ...expenses]);
    setIsAddDialogOpen(false);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      merchant: '',
      category: '',
      total: '',
      tax: '',
      description: '',
    });
    toast.success('Expense added successfully');
  };

  const handleDelete = (id: number) => {
    setExpenses(expenses.filter((e) => e.id !== id));
    toast.success('Expense deleted');
  };

  const handleScanReceipt = () => {
    toast.info('Camera access requested for receipt scanning');
    setTimeout(() => {
      setIsScanDialogOpen(false);
      setIsAddDialogOpen(true);
      setFormData((prev) => ({
        ...prev,
        merchant: 'Auto-detected Store',
        total: '45.67',
        tax: '4.57',
        description: 'Scanned receipt',
      }));
      toast.success('Receipt scanned successfully');
    }, 1500);
  };

  const getCategoryLabel = (value: string) =>
    categories.find((c) => c.value === value)?.label || value;

  const getCategoryColor = (value: string) =>
    categories.find((c) => c.value === value)?.color || '#6b7280';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/tools">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#1f1f1f]">Expenses</h1>
          <p className="text-[#5d6c7b]">Track and manage your business expenses</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[#5d6c7b]">Total Expenses</p>
                <p className="text-2xl font-bold text-[#1f1f1f]">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#5d6c7b]">Total Tax</p>
                <p className="text-2xl font-bold text-[#1f1f1f]">
                  ${totalTax.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-[#5d6c7b]">Categories</p>
                <p className="text-2xl font-bold text-[#1f1f1f]">
                  {new Set(expenses.map((e) => e.category)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#1f1f1f] mb-4">
              Expenses by Category
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-[#5d6c7b]">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button
                onClick={() => setIsScanDialogOpen(true)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-14"
              >
                <Camera className="w-5 h-5 mr-2" />
                Scan Receipts
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="flex-1 bg-[#0082f3] hover:bg-[#0082f3]/90 text-white h-14"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Expense
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d6c7b]" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-[#1f1f1f] mb-4">
            Recent Expenses ({filteredExpenses.length})
          </h3>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-[#1f1f1f] mb-2">
                Keep track of your expenses
              </h3>
              <p className="text-[#5d6c7b] max-w-md mx-auto mb-6">
                Scan receipts or add expenses manually to monitor your spending
                and simplify tax reporting.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setIsScanDialogOpen(true)}
                  variant="outline"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Receipts
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${getCategoryColor(expense.category)}20`,
                      }}
                    >
                      <Store
                        className="w-6 h-6"
                        style={{ color: getCategoryColor(expense.category) }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-[#1f1f1f]">
                        {expense.merchant}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-[#5d6c7b]">
                        <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: `${getCategoryColor(expense.category)}20`,
                            color: getCategoryColor(expense.category),
                          }}
                        >
                          {getCategoryLabel(expense.category)}
                        </Badge>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-[#5d6c7b] mt-1">
                          {expense.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-[#1f1f1f]">
                        ${expense.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-[#5d6c7b]">
                        Tax: ${expense.tax.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Expense
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Expense Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant">
                <Store className="w-4 h-4 inline mr-1" />
                Merchant
              </Label>
              <Input
                id="merchant"
                placeholder="Enter merchant name"
                value={formData.merchant}
                onChange={(e) =>
                  setFormData({ ...formData, merchant: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Total Amount
                </Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.total}
                  onChange={(e) =>
                    setFormData({ ...formData, total: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Tax Amount
                </Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.tax}
                  onChange={(e) =>
                    setFormData({ ...formData, tax: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                <FileText className="w-4 h-4 inline mr-1" />
                Description
              </Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-[#0082f3]">
                Save Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Scan Receipt Dialog */}
      <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Scan Receipt
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-[#5d6c7b]">Camera preview will appear here</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsScanDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#0082f3]"
                onClick={handleScanReceipt}
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
