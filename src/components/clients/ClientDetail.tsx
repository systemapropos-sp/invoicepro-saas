import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Client, Invoice } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Plus
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

export function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { fetchApi } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    const loadClient = async () => {
      try {
        const res = await fetchApi<{ success: boolean; client: Client; invoices: Invoice[] }>(`/clients/detail.php?id=${id}`);
        if (res.success) {
          setClient(res.client);
          setInvoices(res.invoices);
        }
      } catch (error) {
        console.error('Failed to load client:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadClient();
  }, [id]);

  const handleDelete = async () => {
    try {
      await fetchApi(`/clients/detail.php?id=${id}`, { method: 'DELETE' });
      navigate('/clients');
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0082f3]" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-[#5d6c7b]">Client not found</p>
        <Link to="/clients">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
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
          <Link to="/clients">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0082f3] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-medium text-lg">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1f1f1f]">{client.name}</h1>
              {client.email && (
                <p className="text-sm text-[#5d6c7b]">{client.email}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/invoices/new?client=${client.id}`}>
            <Button className="bg-[#0082f3] hover:bg-[#2895f7]">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
          <Link to={`/clients/${id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#0082f3]" />
                  <span className="text-[#464646]">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#0082f3]" />
                  <span className="text-[#464646]">{client.phone}</span>
                </div>
              )}
              {(client.address || client.city || client.state) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#0082f3] mt-0.5" />
                  <span className="text-[#464646]">
                    {client.address && <div>{client.address}</div>}
                    {(client.city || client.state || client.zip) && (
                      <div>
                        {client.city}{client.city && client.state && ', '}{client.state} {client.zip}
                      </div>
                    )}
                    {client.country && <div>{client.country}</div>}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0082f3]/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#0082f3]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#5d6c7b]">Total Invoiced</p>
                    <p className="font-semibold text-[#1f1f1f]">{formatCurrency(client.total_invoiced || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-[#5d6c7b]">Outstanding Balance</p>
                    <p className={`font-semibold ${(client.balance || 0) > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                      {formatCurrency(client.balance || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#464646] whitespace-pre-line">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Invoices */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0082f3]" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#5d6c7b]">No invoices yet</p>
                  <Link to={`/invoices/new?client=${client.id}`}>
                    <Button variant="outline" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Invoice
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e9e9e9]">
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#5d6c7b]">Invoice #</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#5d6c7b]">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[#5d6c7b]">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-[#5d6c7b]">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr 
                          key={invoice.id} 
                          className="border-b border-[#e9e9e9] hover:bg-[#fafafa] cursor-pointer"
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <td className="py-4 px-4">
                            <span className="text-sm font-medium text-[#0082f3]">{invoice.invoice_number}</span>
                          </td>
                          <td className="py-4 px-4 text-sm text-[#5d6c7b]">
                            {new Date(invoice.issue_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusBadge(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-right">
                            {formatCurrency(invoice.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {client.name}? This will also delete all associated invoices and estimates.
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
