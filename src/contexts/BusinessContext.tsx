import React, { createContext, useContext, useState, useEffect } from 'react';
import { Invoice, Estimate, Client, Vendor, ClientDocument } from '@/types';

interface Business {
  id: string;
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxRate: number;
  taxLabel: string;
  currency: string;
  invoices: Invoice[];
  estimates: Estimate[];
  clients: Client[];
  vendors: Vendor[];
}

interface BusinessContextType {
  currentBusiness: Business;
  businesses: Business[];
  switchBusiness: (businessId: string) => void;
  addBusiness: (business: Omit<Business, 'id' | 'invoices' | 'estimates' | 'clients' | 'vendors'>) => void;
  updateBusiness: (businessId: string, updates: Partial<Business>) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoiceId: number, updates: Partial<Invoice>) => void;
  deleteInvoice: (invoiceId: number) => void;
  addEstimate: (estimate: Estimate) => void;
  updateEstimate: (estimateId: number, updates: Partial<Estimate>) => void;
  deleteEstimate: (estimateId: number) => void;
  addClient: (client: Client) => void;
  updateClient: (clientId: number, updates: Partial<Client>) => void;
  deleteClient: (clientId: number) => void;
  addClientDocument: (clientId: number, document: ClientDocument) => void;
  deleteClientDocument: (clientId: number, documentId: string) => void;
  addVendor: (vendor: Vendor) => void;
  updateVendor: (vendorId: number, updates: Partial<Vendor>) => void;
  deleteVendor: (vendorId: number) => void;
  addVendorDocument: (vendorId: number, document: ClientDocument) => void;
  deleteVendorDocument: (vendorId: number, documentId: string) => void;
}

// Mock data for Business 1
const business1Invoices: Invoice[] = [
  {
    id: 1, user_id: 1, client_id: 1, client_name: 'Jose Aracena (Berto)',
    invoice_number: 'INV0061', issue_date: '2026-03-15', due_date: '2026-04-15',
    status: 'paid', subtotal: 150, tax_rate: 8.875, tax_amount: 13.31, discount_amount: 0, total: 163.31,
    notes: '', terms: '', items: []
  },
  {
    id: 2, user_id: 1, client_id: 2, client_name: 'Westchester Square Family Dental',
    invoice_number: 'INV0060', issue_date: '2026-03-10', due_date: '2026-04-10',
    status: 'paid', subtotal: 408.28, tax_rate: 0, tax_amount: 0, discount_amount: 0, total: 408.28,
    notes: '', terms: '', items: []
  },
  {
    id: 3, user_id: 1, client_id: 3, client_name: 'Amarilis',
    invoice_number: 'INV0064', issue_date: '2026-03-20', due_date: '2026-04-20',
    status: 'paid', subtotal: 2326.90, tax_rate: 0, tax_amount: 0, discount_amount: 0, total: 2326.90,
    notes: '', terms: '', items: []
  },
  {
    id: 4, user_id: 1, client_id: 3, client_name: 'Amarilis',
    invoice_number: 'INV0062', issue_date: '2026-03-05', due_date: '2026-04-05',
    status: 'overdue', subtotal: 2533.41, tax_rate: 0, tax_amount: 0, discount_amount: 0, total: 2533.41,
    notes: '', terms: '', items: []
  },
  {
    id: 5, user_id: 1, client_id: 4, client_name: 'Winston Vaughan',
    invoice_number: 'INV0063', issue_date: '2026-03-12', due_date: '2026-04-12',
    status: 'paid', subtotal: 2177.39, tax_rate: 0, tax_amount: 0, discount_amount: 0, total: 2177.39,
    notes: '', terms: '', items: []
  },
];

const business1Clients: Client[] = [
  { id: 1, name: 'Jose Aracena (Berto)', email: 'berto@email.com', phone: '+1 555-0001', address: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'USA', total_invoiced: 163.31, balance: 0 },
  { id: 2, name: 'Westchester Square Family Dental', email: 'dental@email.com', phone: '+1 555-0002', address: '456 Dental Ave', city: 'Bronx', state: 'NY', zip: '10461', country: 'USA', total_invoiced: 408.28, balance: 0 },
  { id: 3, name: 'Amarilis', email: 'amarilis@email.com', phone: '+1 555-0003', address: '789 Flower St', city: 'Miami', state: 'FL', zip: '33101', country: 'USA', total_invoiced: 4860.31, balance: 2533.41 },
  { id: 4, name: 'Winston Vaughan', email: 'winston@email.com', phone: '+1 555-0004', address: '321 Vaughan Rd', city: 'Atlanta', state: 'GA', zip: '30301', country: 'USA', total_invoiced: 2177.39, balance: 0 },
];

// Mock data for Business 2
const business2Invoices: Invoice[] = [
  {
    id: 101, user_id: 1, client_id: 101, client_name: 'ABC Construction',
    invoice_number: 'INV-001', issue_date: '2026-03-01', due_date: '2026-04-01',
    status: 'paid', subtotal: 5000, tax_rate: 10, tax_amount: 500, discount_amount: 0, total: 5500,
    notes: '', terms: '', items: []
  },
  {
    id: 102, user_id: 1, client_id: 102, client_name: 'Tech Solutions Inc',
    invoice_number: 'INV-002', issue_date: '2026-03-15', due_date: '2026-04-15',
    status: 'sent', subtotal: 3500, tax_rate: 0, tax_amount: 0, discount_amount: 0, total: 3500,
    notes: '', terms: '', items: []
  },
];

const business2Clients: Client[] = [
  { id: 101, name: 'ABC Construction', email: 'abc@construction.com', phone: '+1 555-1001', address: '100 Builder Way', city: 'Houston', state: 'TX', zip: '77001', country: 'USA', total_invoiced: 5500, balance: 0, documents: [] },
  { id: 102, name: 'Tech Solutions Inc', email: 'info@techsolutions.com', phone: '+1 555-1002', address: '200 Tech Blvd', city: 'Austin', state: 'TX', zip: '78701', country: 'USA', total_invoiced: 3500, balance: 3500, documents: [] },
];

const business1Vendors: Vendor[] = [
  { id: 1, name: 'Security Supplies Co', companyName: 'Security Supplies Co', email: 'orders@secsupplies.com', phone: '+1 555-3001', address: '500 Supply St', city: 'New York', state: 'NY', zip: '10001', country: 'USA', notes: 'Main security equipment supplier', documents: [] },
  { id: 2, name: 'Tech Hardware Inc', companyName: 'Tech Hardware Inc', email: 'sales@techhardware.com', phone: '+1 555-3002', address: '600 Tech Ave', city: 'Brooklyn', state: 'NY', zip: '11201', country: 'USA', notes: 'Camera and monitoring systems', documents: [] },
];

const business2Vendors: Vendor[] = [
  { id: 101, name: 'Building Materials Plus', companyName: 'Building Materials Plus', email: 'orders@bmplus.com', phone: '+1 555-4001', address: '700 Builder Rd', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA', notes: 'Construction materials', documents: [] },
];

const defaultBusinesses: Business[] = [
  {
    id: '1',
    name: 'JP Security LLC',
    logo: '',
    email: 'protection@jpsecurityco.com',
    phone: '+1 555-0100',
    address: '100 Security Blvd',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
    taxRate: 8.875,
    taxLabel: 'TAX',
    currency: 'USD',
    invoices: business1Invoices,
    estimates: [],
    clients: business1Clients,
    vendors: business1Vendors,
  },
  {
    id: '2',
    name: 'Logim Remodeling',
    logo: '',
    email: 'info@logimremodeling.com',
    phone: '+1 555-0200',
    address: '200 Remodeling St',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
    country: 'USA',
    taxRate: 9.5,
    taxLabel: 'TAX',
    currency: 'USD',
    invoices: business2Invoices,
    estimates: [],
    clients: business2Clients,
    vendors: business2Vendors,
  },
];

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('invoicepro_businesses');
    return saved ? JSON.parse(saved) : defaultBusinesses;
  });
  
  const [currentBusinessId, setCurrentBusinessId] = useState<string>(() => {
    return localStorage.getItem('invoicepro_current_business') || '1';
  });

  const currentBusiness = businesses.find(b => b.id === currentBusinessId) || businesses[0];

  useEffect(() => {
    localStorage.setItem('invoicepro_businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem('invoicepro_current_business', currentBusinessId);
  }, [currentBusinessId]);

  const switchBusiness = (businessId: string) => {
    setCurrentBusinessId(businessId);
  };

  const addBusiness = (business: Omit<Business, 'id' | 'invoices' | 'estimates' | 'clients' | 'vendors'>) => {
    const newBusiness: Business = {
      ...business,
      id: Date.now().toString(),
      invoices: [],
      estimates: [],
      clients: [],
      vendors: [],
    };
    setBusinesses([...businesses, newBusiness]);
  };

  const updateBusiness = (businessId: string, updates: Partial<Business>) => {
    setBusinesses(businesses.map(b => 
      b.id === businessId ? { ...b, ...updates } : b
    ));
  };

  const addInvoice = (invoice: Invoice) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { ...b, invoices: [invoice, ...b.invoices] }
        : b
    ));
  };

  const updateInvoice = (invoiceId: number, updates: Partial<Invoice>) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { 
            ...b, 
            invoices: b.invoices.map(i => 
              i.id === invoiceId ? { ...i, ...updates } : i
            )
          }
        : b
    ));
  };

  const deleteInvoice = (invoiceId: number) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { ...b, invoices: b.invoices.filter(i => i.id !== invoiceId) }
        : b
    ));
  };

  const addEstimate = (estimate: Estimate) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { ...b, estimates: [estimate, ...b.estimates] }
        : b
    ));
  };

  const updateEstimate = (estimateId: number, updates: Partial<Estimate>) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { 
            ...b, 
            estimates: b.estimates.map(e => 
              e.id === estimateId ? { ...e, ...updates } : e
            )
          }
        : b
    ));
  };

  const deleteEstimate = (estimateId: number) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { ...b, estimates: b.estimates.filter(e => e.id !== estimateId) }
        : b
    ));
  };

  const addClient = (client: Client) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { ...b, clients: [client, ...b.clients] }
        : b
    ));
  };

  const updateClient = (clientId: number, updates: Partial<Client>) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { 
            ...b, 
            clients: b.clients.map(c => 
              c.id === clientId ? { ...c, ...updates } : c
            )
          }
        : b
    ));
  };

  const deleteClient = (clientId: number) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { ...b, clients: b.clients.filter(c => c.id !== clientId) }
        : b
    ));
  };

  const addClientDocument = (clientId: number, document: ClientDocument) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { 
            ...b, 
            clients: b.clients.map(c => 
              c.id === clientId 
                ? { ...c, documents: [...(c.documents || []), document] }
                : c
            )
          }
        : b
    ));
  };

  const deleteClientDocument = (clientId: number, documentId: string) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { 
            ...b, 
            clients: b.clients.map(c => 
              c.id === clientId 
                ? { ...c, documents: (c.documents || []).filter(d => d.id !== documentId) }
                : c
            )
          }
        : b
    ));
  };

  const addVendor = (vendor: Vendor) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { ...b, vendors: [vendor, ...b.vendors] }
        : b
    ));
  };

  const updateVendor = (vendorId: number, updates: Partial<Vendor>) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { 
            ...b, 
            vendors: b.vendors.map(v => 
              v.id === vendorId ? { ...v, ...updates } : v
            )
          }
        : b
    ));
  };

  const deleteVendor = (vendorId: number) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { ...b, vendors: b.vendors.filter(v => v.id !== vendorId) }
        : b
    ));
  };

  const addVendorDocument = (vendorId: number, document: ClientDocument) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { 
            ...b, 
            vendors: b.vendors.map(v => 
              v.id === vendorId 
                ? { ...v, documents: [...(v.documents || []), document] }
                : v
            )
          }
        : b
    ));
  };

  const deleteVendorDocument = (vendorId: number, documentId: string) => {
    setBusinesses(businesses.map(b => 
      b.id === currentBusinessId 
        ? { 
            ...b, 
            vendors: b.vendors.map(v => 
              v.id === vendorId 
                ? { ...v, documents: (v.documents || []).filter(d => d.id !== documentId) }
                : v
            )
          }
        : b
    ));
  };

  return (
    <BusinessContext.Provider value={{
      currentBusiness,
      businesses,
      switchBusiness,
      addBusiness,
      updateBusiness,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addEstimate,
      updateEstimate,
      deleteEstimate,
      addClient,
      updateClient,
      deleteClient,
      addClientDocument,
      deleteClientDocument,
      addVendor,
      updateVendor,
      deleteVendor,
      addVendorDocument,
      deleteVendorDocument,
    }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
