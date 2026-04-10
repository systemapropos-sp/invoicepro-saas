import { Invoice, Client } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Partial<Invoice>;
  client?: Client;
}

export function InvoicePreview({ invoice, client }: InvoicePreviewProps) {
  const { user } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1f1f1f]">Preview</h3>
        <span className="text-sm text-[#5d6c7b]">Real-time preview</span>
      </div>

      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div className="bg-white p-8 min-h-[800px]">
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
                <p className="text-lg text-[#0082f3] font-medium mt-1">
                  {invoice.invoice_number || 'DRAFT'}
                </p>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-[#fafafa] p-4 rounded-lg">
                <p className="text-xs font-semibold text-[#5d6c7b] uppercase tracking-wide mb-2">Bill To</p>
                {client ? (
                  <div>
                    <p className="font-semibold text-[#1f1f1f]">{client.name}</p>
                    {client.email && <p className="text-sm text-[#5d6c7b]">{client.email}</p>}
                    {client.phone && <p className="text-sm text-[#5d6c7b]">{client.phone}</p>}
                    {client.address && (
                      <p className="text-sm text-[#5d6c7b] mt-1">
                        {client.address}
                        {client.city && `, ${client.city}`}
                        {client.state && `, ${client.state}`}
                        {client.zip && ` ${client.zip}`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[#aaadb0] italic">Select a client</p>
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
                    <td className="py-4 text-sm text-[#464646]">{item.description || '-'}</td>
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
                  <span className="font-medium text-[#1f1f1f]">{formatCurrency(invoice.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#5d6c7b]">Tax ({invoice.tax_rate || 0}%)</span>
                  <span className="font-medium text-[#1f1f1f]">{formatCurrency(invoice.tax_amount || 0)}</span>
                </div>
                {invoice.discount_amount && invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5d6c7b]">Discount</span>
                    <span className="font-medium text-red-600">-{formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-[#1f1f1f]">
                  <span className="text-[#1f1f1f]">Total</span>
                  <span className="text-[#0082f3]">{formatCurrency(invoice.total || 0)}</span>
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
    </div>
  );
}
