import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Invoice } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Send, 
  Trash2, 
  Loader2,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';

export function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { fetchApi } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const res = await fetchApi<{ success: boolean; invoice: Invoice }>(`/invoices/detail.php?id=${id}`);
        if (res.success) {
          setInvoice(res.invoice);
        }
      } catch (error) {
        console.error('Failed to load invoice:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInvoice();
  }, [id]);

  const handleDelete = async () => {
    try {
      await fetchApi(`/invoices/detail.php?id=${id}`, { method: 'DELETE' });
      navigate('/invoices');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  const updateStatus = async (status: string) => {
    setIsUpdating(true);
    try {
      const res = await fetchApi<{ success: boolean; invoice: Invoice }>(`/invoices/detail.php?id=${id}`, {
        method: 'PUT',
        body: { status }
      });
      if (res.success) {
        setInvoice(res.invoice);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'sent':
      case 'viewed':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0082f3]" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-[#5d6c7b]">Invoice not found</p>
        <Link to="/invoices">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/invoices">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1f1f1f]">{invoice.invoice_number}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusIcon(invoice.status)}
              <Badge className={getStatusBadge(invoice.status)}>
                {invoice.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.status === 'draft' && (
            <Button 
              className="bg-[#0082f3] hover:bg-[#2895f7]"
              onClick={() => updateStatus('sent')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send
            </Button>
          )}
          {invoice.status === 'sent' && (
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => updateStatus('paid')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Mark as Paid
            </Button>
          )}
          <Link to={`/invoices/${id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-white p-8 lg:p-12">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                {user?.company_name ? (
                  <div>
                    <h2 className="text-2xl font-bold text-[#1f1f1f]">{user.company_name}</h2>
                    {user.company_address && (
                      <p className="text-sm text-[#5d6c7b] mt-1 whitespace-pre-line">{user.company_address}</p>
                    )}
                    {user.company_phone && (
                      <p className="text-sm text-[#5d6c7b]">{user.company_phone}</p>
                    )}
                    {user.company_email && (
                      <p className="text-sm text-[#5d6c7b]">{user.company_email}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#0082f3] rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-[#1f1f1f]">InvoiceFly</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-[#1f1f1f]">INVOICE</h1>
                <p className="text-lg text-[#0082f3] font-medium mt-1">{invoice.invoice_number}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-[#fafafa] p-4 rounded-lg">
                <p className="text-xs font-semibold text-[#5d6c7b] uppercase tracking-wide mb-2">Bill To</p>
                <p className="font-semibold text-[#1f1f1f]">{invoice.client_name}</p>
                {invoice.client_email && <p className="text-sm text-[#5d6c7b]">{invoice.client_email}</p>}
                {invoice.client_phone && <p className="text-sm text-[#5d6c7b]">{invoice.client_phone}</p>}
                {invoice.client_address && (
                  <p className="text-sm text-[#5d6c7b] mt-1">
                    {invoice.client_address}
                    {invoice.client_city && `, ${invoice.client_city}`}
                    {invoice.client_state && `, ${invoice.client_state}`}
                    {invoice.client_zip && ` ${invoice.client_zip}`}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#5d6c7b]">Issue Date:</span>
                  <span className="text-sm font-medium text-[#1f1f1f]">{formatDate(invoice.issue_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#5d6c7b]">Due Date:</span>
                  <span className="text-sm font-medium text-[#1f1f1f]">{formatDate(invoice.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#5d6c7b]">Status:</span>
                  <span className={`text-sm font-medium capitalize ${
                    invoice.status === 'paid' ? 'text-green-600' :
                    invoice.status === 'overdue' ? 'text-red-600' :
                    invoice.status === 'sent' ? 'text-blue-600' :
                    'text-[#5d6c7b]'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-[#1f1f1f]">
                  <th className="text-left py-3 text-sm font-semibold text-[#1f1f1f]">Description</th>
                  <th className="text-center py-3 text-sm font-semibold text-[#1f1f1f]">Quantity</th>
                  <th className="text-right py-3 text-sm font-semibold text-[#1f1f1f]">Rate</th>
                  <th className="text-right py-3 text-sm font-semibold text-[#1f1f1f]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className="border-b border-[#e9e9e9]">
                    <td className="py-4 text-sm text-[#464646]">{item.description}</td>
                    <td className="py-4 text-center text-sm text-[#464646]">{item.quantity}</td>
                    <td className="py-4 text-right text-sm text-[#464646]">{formatCurrency(item.rate)}</td>
                    <td className="py-4 text-right text-sm font-medium text-[#1f1f1f]">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5d6c7b]">Subtotal</span>
                  <span className="font-medium text-[#1f1f1f]">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#5d6c7b]">Tax ({invoice.tax_rate}%)</span>
                  <span className="font-medium text-[#1f1f1f]">{formatCurrency(invoice.tax_amount)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5d6c7b]">Discount</span>
                    <span className="font-medium text-red-600">-{formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-[#1f1f1f]">
                  <span className="text-[#1f1f1f]">Total</span>
                  <span className="text-[#0082f3]">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="border-t border-[#e9e9e9] pt-6 space-y-4">
                {invoice.notes && (
                  <div>
                    <p className="text-xs font-semibold text-[#5d6c7b] uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-[#464646] whitespace-pre-line">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="text-xs font-semibold text-[#5d6c7b] uppercase tracking-wide mb-1">Terms & Conditions</p>
                    <p className="text-sm text-[#464646] whitespace-pre-line">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-[#e9e9e9] text-center">
              <p className="text-sm text-[#aaadb0]">Thank you for your business!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoice.invoice_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
