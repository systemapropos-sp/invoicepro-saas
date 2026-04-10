import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  MoreHorizontal,
  Plus,
  Search,
  Users,
  Edit,
  Trash2,
  Mail,
  Phone,
  FileText,
  ArrowLeft,
  Upload,
  X,
  File,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, ClientDocument } from '@/types';

export function ClientList() {
  const { t } = useTranslation();
  const { currentBusiness, deleteClient, addClientDocument, deleteClientDocument } = useBusiness();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const filteredClients = currentBusiness.clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clientToDelete?.id) {
      deleteClient(clientToDelete.id);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleFileUpload = (clientId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const document: ClientDocument = {
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      addClientDocument(clientId, document);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
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
            <h1 className="text-3xl font-bold text-[#1f1f1f]">{t('clients.title')}</h1>
            <p className="text-[#5d6c7b] mt-1">{currentBusiness.clients.length} {t('clients.title').toLowerCase()}</p>
          </div>
        </div>
        <Button 
          className="bg-[#0082f3] hover:bg-[#2895f7]"
          onClick={() => navigate('/clients/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('clients.newClient')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaadb0]" />
        <Input
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-[#aaadb0] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1f1f1f] mb-1">{t('clients.noClients')}</h3>
            <p className="text-[#5d6c7b] mb-4">{t('clients.addFirst')}</p>
            <Button 
              className="bg-[#0082f3] hover:bg-[#2895f7]"
              onClick={() => navigate('/clients/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('clients.newClient')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => navigate(`/clients/${client.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0082f3] to-[#2895f7] rounded-xl flex items-center justify-center text-white font-medium text-lg overflow-hidden">
                      {client.profileImage ? (
                        <img src={client.profileImage} alt={client.name} className="w-full h-full object-cover" />
                      ) : (
                        client.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-[#1f1f1f]">{client.name}</h3>
                      {client.email && (
                        <p className="text-sm text-[#5d6c7b]">{client.email}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        {t('common.view')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSelectedClient(client); setShowDocuments(true); }}>
                        <FileText className="w-4 h-4 mr-2" />
                        {t('clients.documents')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(client)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-[#5d6c7b]">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-[#5d6c7b]">
                      <Mail className="w-4 h-4" />
                      <span>{client.city}, {client.state}</span>
                    </div>
                  )}
                  {client.documents && client.documents.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-[#0082f3]">
                      <FileText className="w-4 h-4" />
                      <span>{client.documents.length} {t('clients.documents').toLowerCase()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[#e9e9e9] grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#5d6c7b]">{t('clients.totalInvoiced')}</p>
                    <p className="font-semibold text-[#1f1f1f]">{formatCurrency(client.total_invoiced)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5d6c7b]">{t('clients.balance')}</p>
                    <p className={`font-semibold ${(client.balance || 0) > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                      {formatCurrency(client.balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Documents Dialog */}
      <Dialog open={showDocuments} onOpenChange={setShowDocuments}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('clients.documents')} - {selectedClient?.name}</DialogTitle>
            <DialogDescription>
              {t('clients.uploadDocument')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Upload Button */}
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => selectedClient?.id && handleFileUpload(selectedClient.id, e)}
                />
                <div className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-[#e9e9e9] rounded-lg hover:border-[#0082f3] hover:bg-[#0082f3]/5 transition-colors">
                  <Upload className="w-8 h-8 text-[#0082f3]" />
                  <span className="text-sm text-[#5d6c7b]">{t('clients.uploadDocument')}</span>
                </div>
              </label>
            </div>

            {/* Documents List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedClient?.documents && selectedClient.documents.length > 0 ? (
                selectedClient.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-[#fafafa] rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-[#0082f3]" />
                      <div>
                        <p className="text-sm font-medium text-[#1f1f1f]">{doc.name}</p>
                        <p className="text-xs text-[#5d6c7b]">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        {t('common.view')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => selectedClient.id && deleteClientDocument(selectedClient.id, doc.id)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#5d6c7b] py-4">{t('clients.noDocuments')}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.delete')}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {clientToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
