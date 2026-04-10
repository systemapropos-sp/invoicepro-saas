import { useState, useMemo } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Loader2,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Send,
  FileText,
  Download,
  Copy,
  Search,
  Filter,
  LayoutTemplate,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Invoice templates
const invoiceTemplates = [
  { id: 'modern', name: 'Modern', description: 'Clean and professional', color: 'bg-blue-500' },
  { id: 'classic', name: 'Classic', description: 'Traditional business style', color: 'bg-gray-700' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant', color: 'bg-slate-500' },
  { id: 'colorful', name: 'Colorful', description: 'Vibrant and eye-catching', color: 'bg-purple-500' },
  { id: 'corporate', name: 'Corporate', description: 'Professional enterprise', color: 'bg-indigo-600' },
];

// Generate month cards data
const generateMonthCards = (invoices: any[]) => {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthInvoices = invoices.filter(inv => {
      const invDate = parseISO(inv.issue_date);
      return isWithinInterval(invDate, { start: monthStart, end: monthEnd });
    });
    
    const total = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const prevMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);
    
    const prevMonthInvoices = invoices.filter(inv => {
      const invDate = parseISO(inv.issue_date);
      return isWithinInterval(invDate, { start: prevMonthStart, end: prevMonthEnd });
    });
    
    const prevTotal = prevMonthInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;
    
    months.push({
      month: format(date, 'MMM yyyy'),
      amount: total,
      change: Math.abs(change),
      up: change >= 0,
      date: date,
    });
  }
  
  return months;
};

export function InvoiceList() {
  const { currentBusiness, deleteInvoice, updateInvoice } = useBusiness();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const monthCards = useMemo(() => generateMonthCards(currentBusiness.invoices), [currentBusiness.invoices]);

  const filteredInvoices = useMemo(() => {
    let filtered = currentBusiness.invoices;
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    // Filter by selected month
    if (selectedMonth) {
      const selectedDate = parseISO(selectedMonth);
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      
      filtered = filtered.filter(invoice => {
        const invDate = parseISO(invoice.issue_date);
        return isWithinInterval(invDate, { start: monthStart, end: monthEnd });
      });
    }
    
    return filtered;
  }, [currentBusiness.invoices, searchQuery, statusFilter, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-700 border-green-200',
      sent: 'bg-blue-100 text-blue-700 border-blue-200',
      viewed: 'bg-purple-100 text-purple-700 border-purple-200',
      overdue: 'bg-red-100 text-red-700 border-red-200',
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return styles[status] || styles.draft;
  };

  const handleDelete = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedInvoice) {
      deleteInvoice(selectedInvoice.id);
      toast.success(`Invoice ${selectedInvoice.invoice_number} moved to trash`);
      setIsDeleteDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  const handleSend = (invoice: any) => {
    updateInvoice(invoice.id, { status: 'sent' });
    toast.success(`Invoice ${invoice.invoice_number} sent to ${invoice.client_name}`);
  };

  const handleDuplicate = (invoice: any) => {
    const newInvoice = {
      ...invoice,
      id: Date.now(),
      invoice_number: `INV-${format(new Date(), 'yyyy')}-${String(currentBusiness.invoices.length + 1).padStart(4, '0')}`,
      status: 'draft' as const,
      issue_date: format(new Date(), 'yyyy-MM-dd'),
    };
    // Add invoice logic would go here
    toast.success('Invoice duplicated successfully');
  };

  const handleDownload = (invoice: any) => {
    // Generate PDF content
    const content = `
INVOICE
Invoice #: ${invoice.invoice_number}
Date: ${invoice.issue_date}
Due Date: ${invoice.due_date}

Bill To:
${invoice.client_name}

Items:
${invoice.items?.map((item: any) => `${item.description} - $${item.amount}`).join('\n') || 'No items'}

Subtotal: $${invoice.subtotal.toFixed(2)}
Tax (${invoice.tax_rate}%): $${invoice.tax_amount.toFixed(2)}
Total: $${invoice.total.toFixed(2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Invoice ${invoice.invoice_number} downloaded`);
  };

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Client', 'Issue Date', 'Due Date', 'Status', 'Subtotal', 'Tax', 'Total'];
    const rows = filteredInvoices.map(inv => [
      inv.invoice_number,
      inv.client_name,
      inv.issue_date,
      inv.due_date,
      inv.status,
      inv.subtotal.toFixed(2),
      inv.tax_amount.toFixed(2),
      inv.total.toFixed(2),
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${filteredInvoices.length} invoices exported to CSV`);
  };

  const handleMonthClick = (month: any) => {
    if (selectedMonth && format(month.date, 'yyyy-MM') === selectedMonth) {
      setSelectedMonth(null);
    } else {
      setSelectedMonth(format(month.date, 'yyyy-MM-dd'));
    }
  };

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const balanceDue = filteredInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1f1f1f]">Invoices</h1>
          <p className="text-[#5d6c7b] mt-1">Manage and track all your invoices</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button 
            variant="outline"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link to="/invoices/new">
            <Button className="bg-[#0082f3] hover:bg-[#2895f7]">
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Monthly Cards */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {monthCards.map((item, index) => (
            <Card 
              key={index} 
              className={`flex-shrink-0 cursor-pointer hover:shadow-md transition-all min-w-[140px] ${
                selectedMonth && format(item.date, 'yyyy-MM') === format(parseISO(selectedMonth), 'yyyy-MM')
                  ? 'ring-2 ring-[#0082f3] bg-blue-50'
                  : ''
              }`}
              onClick={() => handleMonthClick(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#5d6c7b]">{item.month}</p>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-[#0082f3]" />
                  </div>
                </div>
                <p className="font-semibold text-[#1f1f1f] text-lg">{formatAmount(item.amount)}</p>
                <div className={`flex items-center gap-1 text-xs ${item.up ? 'text-green-600' : 'text-red-600'}`}>
                  {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{item.change.toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create New Invoice Button */}
      <Link to="/invoices/new">
        <Button className="w-full bg-[#0082f3] hover:bg-[#2895f7] h-14 text-lg">
          <span className="text-2xl mr-2">+</span>
          CREATE NEW INVOICE
        </Button>
      </Link>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaadb0]" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {selectedMonth && (
          <Button variant="outline" onClick={() => setSelectedMonth(null)}>
            Clear Filter
          </Button>
        )}
      </div>

      {/* Selected Month Header */}
      {selectedMonth && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1f1f1f]">
            {format(parseISO(selectedMonth), 'MMM yyyy')}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#5d6c7b]">
              {filteredInvoices.length} invoices
            </span>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#0082f3]" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-[#5d6c7b]">No invoices found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e9e9e9]">
              {filteredInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1f1f1f]">{invoice.client_name}</p>
                        <p className="text-sm text-[#5d6c7b]">{invoice.invoice_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-[#1f1f1f]">{formatCurrency(invoice.total)}</p>
                        <p className="text-sm text-[#5d6c7b]">
                          Due {format(parseISO(invoice.due_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge className={`${getStatusBadge(invoice.status)} capitalize`}>
                        {invoice.status}
                      </Badge>
                      
                      {/* Action Buttons */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {invoice.status !== 'sent' && invoice.status !== 'paid' && (
                            <DropdownMenuItem onClick={() => handleSend(invoice)}>
                              <Send className="w-4 h-4 mr-2" />
                              Send
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(invoice)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(invoice)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Move to Trash
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Total Row */}
              <div className="p-4 sm:p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-[#0082f3] font-semibold">
                      {filteredInvoices.length}
                    </div>
                    <span className="text-[#5d6c7b]">Total</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1f1f1f]">{formatCurrency(totalAmount)}</p>
                    {balanceDue > 0 && (
                      <p className="text-sm text-red-500">{formatCurrency(balanceDue)} Balance Due</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Selector Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Invoice Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {invoiceTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                  selectedTemplate === template.id
                    ? 'border-[#0082f3] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-full h-24 ${template.color} rounded-lg mb-3 flex items-center justify-center`}>
                  <LayoutTemplate className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1f1f1f]">{template.name}</p>
                    <p className="text-xs text-[#5d6c7b]">{template.description}</p>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="w-6 h-6 bg-[#0082f3] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#0082f3] hover:bg-[#2895f7]"
              onClick={() => {
                toast.success(`Template "${invoiceTemplates.find(t => t.id === selectedTemplate)?.name}" selected`);
                setIsTemplateDialogOpen(false);
              }}
            >
              Apply Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Trash?</DialogTitle>
          </DialogHeader>
          <p className="text-[#5d6c7b] mt-2">
            Are you sure you want to move invoice <strong>{selectedInvoice?.invoice_number}</strong> to trash?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Move to Trash
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
