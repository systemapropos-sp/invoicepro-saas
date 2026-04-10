import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Save, Send, Plus, Trash2, FileText, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Service {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export function InvoiceForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBusiness, addInvoice, updateInvoice } = useBusiness();
  const isEditing = !!id;

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: `INV-${format(new Date(), 'yyyy')}-${String(currentBusiness.invoices.length + 1).padStart(4, '0')}`,
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    notes: '',
    terms: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  const [services, setServices] = useState<Service[]>([]);

  const [taxRate, setTaxRate] = useState(currentBusiness.taxRate);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (isEditing && id) {
      const invoice = currentBusiness.invoices.find(i => i.id === Number(id));
      if (invoice) {
        setFormData({
          clientId: invoice.client_id.toString(),
          invoiceNumber: invoice.invoice_number,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          notes: invoice.notes || '',
          terms: invoice.terms || '',
        });
        setTaxRate(invoice.tax_rate);
        setDiscountAmount(invoice.discount_amount);
      }
    }
  }, [id, currentBusiness.invoices, isEditing]);

  const itemsSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const servicesSubtotal = services.reduce((sum, service) => sum + service.amount, 0);
  const subtotal = itemsSubtotal + servicesSubtotal;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discountAmount;

  const handleItemChange = (id: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
    setHasChanges(true);
  };

  const addItem = () => {
    setItems([...items, { 
      id: Date.now(), 
      description: '', 
      quantity: 1, 
      rate: 0, 
      amount: 0 
    }]);
    setHasChanges(true);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      setHasChanges(true);
    }
  };

  // Service handlers
  const handleServiceChange = (id: number, field: keyof Service, value: string | number) => {
    setServices(services.map(service => {
      if (service.id === id) {
        const updated = { ...service, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return service;
    }));
    setHasChanges(true);
  };

  const addService = () => {
    setServices([...services, { 
      id: Date.now(), 
      description: '', 
      quantity: 1, 
      rate: 0, 
      amount: 0 
    }]);
    setHasChanges(true);
  };

  const removeService = (id: number) => {
    setServices(services.filter(service => service.id !== id));
    setHasChanges(true);
  };

  const handleSave = (send: boolean = false) => {
    if (!formData.clientId) {
      toast.error('Please select a client');
      return;
    }

    const client = currentBusiness.clients.find(c => c.id === Number(formData.clientId));
    
    const invoiceData = {
      id: isEditing ? Number(id) : Date.now(),
      user_id: 1,
      client_id: Number(formData.clientId),
      client_name: client?.name || 'Unknown Client',
      invoice_number: formData.invoiceNumber,
      issue_date: formData.issueDate,
      due_date: formData.dueDate,
      status: send ? 'sent' as const : 'draft' as const,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total,
      notes: formData.notes,
      terms: formData.terms,
      items,
    };

    if (isEditing) {
      updateInvoice(Number(id), invoiceData);
      toast.success(send ? 'Invoice sent successfully' : 'Invoice saved as draft');
    } else {
      addInvoice(invoiceData);
      toast.success(send ? 'Invoice created and sent' : 'Invoice saved as draft');
    }
    
    navigate('/invoices');
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      navigate('/invoices');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1f1f1f]">{formData.invoiceNumber}</h1>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <FileText className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[#0082f3] text-sm">Details</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSave(false)}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button className="bg-[#0082f3] hover:bg-[#2895f7]" onClick={() => handleSave(true)}>
            <Send className="w-4 h-4 mr-2" />
            Save & Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-sm text-[#5d6c7b]">Client</Label>
              <Select 
                value={formData.clientId} 
                onValueChange={(value) => {
                  setFormData({ ...formData, clientId: value });
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {currentBusiness.clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#0082f3] to-[#8b5cf6] rounded-full flex items-center justify-center text-white text-xs">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span>Bill to: {client.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-[#1f1f1f] mb-4">Items</h3>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-6">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 bg-[#0082f3] text-white hover:bg-[#2895f7]"
                onClick={addItem}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('invoices.addItem')}
              </Button>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-[#1f1f1f] mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#0082f3]" />
                {t('invoices.services')}
              </h3>
              <div className="space-y-4">
                {services.length === 0 ? (
                  <p className="text-sm text-[#5d6c7b] text-center py-4">{t('invoices.addService')}</p>
                ) : (
                  services.map((service, index) => (
                    <div key={service.id} className="grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-6">
                        <Input
                          placeholder={t('invoices.serviceDescription')}
                          value={service.description}
                          onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={service.quantity}
                          onChange={(e) => handleServiceChange(service.id, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder={t('invoices.serviceRate')}
                          value={service.rate}
                          onChange={(e) => handleServiceChange(service.id, 'rate', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeService(service.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-[#0082f3] text-[#0082f3] hover:bg-[#0082f3]/10"
                onClick={addService}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('invoices.addService')}
              </Button>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#5d6c7b]">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                    <span className="text-[#5d6c7b]">Discount</span>
                  </div>
                  <span className="font-medium">${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                    <span className="text-[#5d6c7b]">{currentBusiness.taxLabel} ({taxRate}%)</span>
                  </div>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-semibold text-[#1f1f1f]">Total</span>
                  <span className="font-semibold text-[#1f1f1f]">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-sm text-[#5d6c7b]">Notes</Label>
              <p className="text-xs text-[#aaadb0] mt-1">Comments will appear at the bottom of your invoice</p>
              <textarea
                className="w-full mt-3 p-3 border rounded-lg resize-none"
                rows={3}
                value={formData.notes}
                onChange={(e) => {
                  setFormData({ ...formData, notes: e.target.value });
                  setHasChanges(true);
                }}
                placeholder="Add any notes here..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm text-[#5d6c7b]">Invoice Number</Label>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, invoiceNumber: e.target.value });
                    setHasChanges(true);
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-[#5d6c7b]">Issue Date</Label>
                <Input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, issueDate: e.target.value });
                    setHasChanges(true);
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-[#5d6c7b]">Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDate: e.target.value });
                    setHasChanges(true);
                  }}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discard Changes Dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="bg-[#0082f3] text-white p-4 -mx-6 -mt-6 mb-4 rounded-t-lg">
            <DialogTitle className="text-center text-white">Save changes before closing?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => navigate('/invoices')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Discard changes
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowDiscardDialog(false)}
            >
              <span className="w-4 h-4 mr-2">✕</span>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
