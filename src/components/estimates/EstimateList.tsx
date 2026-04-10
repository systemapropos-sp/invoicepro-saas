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
  CheckCircle,
  XCircle,
  Search,
  Filter,
  FileCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Generate month cards data
const generateMonthCards = (estimates: any[]) => {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthEstimates = estimates.filter(est => {
      const estDate = parseISO(est.issue_date);
      return isWithinInterval(estDate, { start: monthStart, end: monthEnd });
    });
    
    const total = monthEstimates.reduce((sum, est) => sum + est.total, 0);
    const prevMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);
    
    const prevMonthEstimates = estimates.filter(est => {
      const estDate = parseISO(est.issue_date);
      return isWithinInterval(estDate, { start: prevMonthStart, end: prevMonthEnd });
    });
    
    const prevTotal = prevMonthEstimates.reduce((sum, est) => sum + est.total, 0);
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

export function EstimateList() {
  const { currentBusiness, deleteEstimate, updateEstimate } = useBusiness();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);

  const monthCards = useMemo(() => generateMonthCards(currentBusiness.estimates), [currentBusiness.estimates]);

  const filteredEstimates = useMemo(() => {
    let filtered = currentBusiness.estimates;
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(estimate => 
        estimate.estimate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        estimate.client_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(estimate => estimate.status === statusFilter);
    }
    
    // Filter by selected month
    if (selectedMonth) {
      const selectedDate = parseISO(selectedMonth);
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      
      filtered = filtered.filter(estimate => {
        const estDate = parseISO(estimate.issue_date);
        return isWithinInterval(estDate, { start: monthStart, end: monthEnd });
      });
    }
    
    return filtered;
  }, [currentBusiness.estimates, searchQuery, statusFilter, selectedMonth]);

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
      approved: 'bg-green-100 text-green-700 border-green-200',
      sent: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      declined: 'bg-red-100 text-red-700 border-red-200',
      converted: 'bg-purple-100 text-purple-700 border-purple-200',
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[status] || styles.draft;
  };

  const handleDelete = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEstimate) {
      deleteEstimate(selectedEstimate.id);
      toast.success(`Estimate ${selectedEstimate.estimate_number} moved to trash`);
      setIsDeleteDialogOpen(false);
      setSelectedEstimate(null);
    }
  };

  const handleSend = (estimate: any) => {
    updateEstimate(estimate.id, { status: 'sent' });
    toast.success(`Estimate ${estimate.estimate_number} sent to ${estimate.client_name}`);
  };

  const handleDuplicate = (estimate: any) => {
    const newEstimate = {
      ...estimate,
      id: Date.now(),
      estimate_number: `EST-${format(new Date(), 'yyyy')}-${String(currentBusiness.estimates.length + 1).padStart(4, '0')}`,
      status: 'draft' as const,
      issue_date: format(new Date(), 'yyyy-MM-dd'),
    };
    // Add estimate logic would go here
    toast.success('Estimate duplicated successfully');
  };

  const handleConvertToInvoice = (estimate: any) => {
    updateEstimate(estimate.id, { status: 'converted' });
    toast.success(`Estimate ${estimate.estimate_number} converted to invoice`);
  };

  const handleDownload = (estimate: any) => {
    const content = `
ESTIMATE
Estimate #: ${estimate.estimate_number}
Date: ${estimate.issue_date}
Valid Until: ${estimate.valid_until}

Bill To:
${estimate.client_name}

Items:
${estimate.items?.map((item: any) => `${item.description} - $${item.amount}`).join('\n') || 'No items'}

Subtotal: $${estimate.subtotal.toFixed(2)}
Tax (${estimate.tax_rate}%): $${estimate.tax_amount.toFixed(2)}
Total: $${estimate.total.toFixed(2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${estimate.estimate_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Estimate ${estimate.estimate_number} downloaded`);
  };

  const handleApprove = (estimate: any) => {
    updateEstimate(estimate.id, { status: 'approved' });
    toast.success(`Estimate ${estimate.estimate_number} approved`);
  };

  const handleDecline = (estimate: any) => {
    updateEstimate(estimate.id, { status: 'declined' });
    toast.success(`Estimate ${estimate.estimate_number} declined`);
  };

  const handleExportCSV = () => {
    const headers = ['Estimate Number', 'Client', 'Issue Date', 'Valid Until', 'Status', 'Subtotal', 'Tax', 'Total'];
    const rows = filteredEstimates.map(est => [
      est.estimate_number,
      est.client_name,
      est.issue_date,
      est.valid_until || '',
      est.status,
      est.subtotal.toFixed(2),
      est.tax_amount.toFixed(2),
      est.total.toFixed(2),
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estimates_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${filteredEstimates.length} estimates exported to CSV`);
  };

  const handleMonthClick = (month: any) => {
    if (selectedMonth && format(month.date, 'yyyy-MM') === format(parseISO(selectedMonth), 'yyyy-MM')) {
      setSelectedMonth(null);
    } else {
      setSelectedMonth(format(month.date, 'yyyy-MM-dd'));
    }
  };

  const totalAmount = filteredEstimates.reduce((sum, est) => sum + est.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1f1f1f]">Estimates</h1>
          <p className="text-[#5d6c7b] mt-1">Create and manage estimates for your clients</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link to="/estimates/new">
            <Button className="bg-[#0082f3] hover:bg-[#2895f7]">
              Create Estimate
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
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-purple-600" />
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

      {/* Create New Estimate Button */}
      <Link to="/estimates/new">
        <Button className="w-full bg-[#0082f3] hover:bg-[#2895f7] h-14 text-lg">
          <span className="text-2xl mr-2">+</span>
          CREATE NEW ESTIMATE
        </Button>
      </Link>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaadb0]" />
          <Input
            placeholder="Search estimates..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
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
              {filteredEstimates.length} estimates
            </span>
          </div>
        </div>
      )}

      {/* Estimates List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#0082f3]" />
            </div>
          ) : filteredEstimates.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-[#5d6c7b]">No estimates found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e9e9e9]">
              {filteredEstimates.map((estimate) => (
                <div 
                  key={estimate.id} 
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1f1f1f]">{estimate.client_name}</p>
                        <p className="text-sm text-[#5d6c7b]">{estimate.estimate_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-[#1f1f1f]">{formatCurrency(estimate.total)}</p>
                        <p className="text-sm text-[#5d6c7b]">
                          Valid until {estimate.valid_until ? format(parseISO(estimate.valid_until), 'MMM d, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <Badge className={`${getStatusBadge(estimate.status)} capitalize`}>
                        {estimate.status}
                      </Badge>
                      
                      {/* Action Buttons */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => navigate(`/estimates/${estimate.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/estimates/${estimate.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {estimate.status !== 'sent' && estimate.status !== 'approved' && estimate.status !== 'converted' && (
                            <DropdownMenuItem onClick={() => handleSend(estimate)}>
                              <Send className="w-4 h-4 mr-2" />
                              Send
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDownload(estimate)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(estimate)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {estimate.status !== 'approved' && estimate.status !== 'declined' && estimate.status !== 'converted' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(estimate)}>
                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                Mark as Approved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDecline(estimate)}>
                                <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                Mark as Declined
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleConvertToInvoice(estimate)}>
                            <FileCheck className="w-4 h-4 mr-2 text-blue-600" />
                            Convert to Invoice
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(estimate)}
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
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                      {filteredEstimates.length}
                    </div>
                    <span className="text-[#5d6c7b]">Total</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1f1f1f]">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Trash?</DialogTitle>
          </DialogHeader>
          <p className="text-[#5d6c7b] mt-2">
            Are you sure you want to move estimate <strong>{selectedEstimate?.estimate_number}</strong> to trash?
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
