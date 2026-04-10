// Mock data stored in memory (not localStorage)
const mockData: {
  users: (User & { password: string })[];
  clients: Client[];
  items: SavedItem[];
  invoices: Invoice[];
  estimates: Estimate[];
} = {
  users: [
    { id: 1, name: 'Demo User', email: 'demo@invoicefly.com', password: 'password', company_name: 'Demo Company', company_address: '123 Business St\nNew York, NY 10001', company_phone: '+1 555-123-4567', company_email: 'contact@democompany.com' }
  ],
  clients: [
    { id: 1, user_id: 1, name: 'John Smith Construction', email: 'john@smithconstruction.com', phone: '+1 555-234-5678', address: '456 Builder Ave', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA', total_invoiced: 5000, balance: 0 },
    { id: 2, user_id: 1, name: 'Sarah Johnson Design', email: 'sarah@sjdesign.com', phone: '+1 555-345-6789', address: '789 Creative Blvd', city: 'Chicago', state: 'IL', zip: '60601', country: 'USA', total_invoiced: 3500, balance: 1500 },
    { id: 3, user_id: 1, name: 'Mike Plumbing Services', email: 'mike@mikeplumbing.com', phone: '+1 555-456-7890', address: '321 Pipe Street', city: 'Houston', state: 'TX', zip: '77001', country: 'USA', total_invoiced: 2800, balance: 800 }
  ],
  items: [
    { id: 1, user_id: 1, name: 'Web Design', description: 'Professional web design services', rate: 150 },
    { id: 2, user_id: 1, name: 'Development', description: 'Web development hourly rate', rate: 120 },
    { id: 3, user_id: 1, name: 'Consulting', description: 'Business consulting services', rate: 200 },
    { id: 4, user_id: 1, name: 'Maintenance', description: 'Monthly website maintenance', rate: 75 }
  ],
  invoices: [
    {
      id: 1, user_id: 1, client_id: 1, client_name: 'John Smith Construction', client_email: 'john@smithconstruction.com',
      invoice_number: 'INV-2024-0001', issue_date: '2024-01-15', due_date: '2024-02-15', status: 'paid',
      subtotal: 3000, tax_rate: 10, tax_amount: 300, discount_amount: 0, total: 3300,
      notes: 'Thank you for your business!', terms: 'Payment due within 30 days.',
      items: [
        { id: 1, invoice_id: 1, description: 'Website Design - Homepage', quantity: 1, rate: 1500, amount: 1500 },
        { id: 2, invoice_id: 1, description: 'Website Design - About Page', quantity: 1, rate: 1000, amount: 1000 },
        { id: 3, invoice_id: 1, description: 'Development Hours', quantity: 10, rate: 50, amount: 500 }
      ]
    },
    {
      id: 2, user_id: 1, client_id: 2, client_name: 'Sarah Johnson Design', client_email: 'sarah@sjdesign.com',
      invoice_number: 'INV-2024-0002', issue_date: '2024-02-01', due_date: '2024-03-01', status: 'sent',
      subtotal: 1500, tax_rate: 0, tax_amount: 0, discount_amount: 0, total: 1500,
      notes: '', terms: 'Payment due within 30 days.',
      items: [
        { id: 4, invoice_id: 2, description: 'Logo Design', quantity: 1, rate: 1000, amount: 1000 },
        { id: 5, invoice_id: 2, description: 'Business Card Design', quantity: 1, rate: 500, amount: 500 }
      ]
    },
    {
      id: 3, user_id: 1, client_id: 3, client_name: 'Mike Plumbing Services', client_email: 'mike@mikeplumbing.com',
      invoice_number: 'INV-2024-0003', issue_date: '2024-03-10', due_date: '2024-04-10', status: 'overdue',
      subtotal: 800, tax_rate: 8, tax_amount: 64, discount_amount: 0, total: 864,
      notes: '', terms: 'Payment due within 30 days.',
      items: [
        { id: 6, invoice_id: 3, description: 'Emergency Plumbing Service', quantity: 4, rate: 200, amount: 800 }
      ]
    }
  ],
  estimates: [
    {
      id: 1, user_id: 1, client_id: 1, client_name: 'John Smith Construction',
      estimate_number: 'EST-2024-0001', issue_date: '2024-03-01', valid_until: '2024-04-01', status: 'approved',
      subtotal: 5000, tax_rate: 10, tax_amount: 500, discount_amount: 0, total: 5500,
      notes: 'Full website redesign project',
      items: [
        { id: 1, estimate_id: 1, description: 'Complete Website Redesign', quantity: 1, rate: 5000, amount: 5000 }
      ]
    }
  ]
};

import type { 
  User, Client, Invoice, Estimate, SavedItem, 
  DashboardStats, InvoiceItem, EstimateItem, ApiOptions
} from '@/types';

// Current user (set during login)
let currentUserId = 1;

// Helper functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNextId = (items: any[]): number => {
  return items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1;
};

const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const count = mockData.invoices.filter(i => i.invoice_number?.includes(`INV-${year}`)).length + 1;
  return `INV-${year}-${String(count).padStart(4, '0')}`;
};

const generateEstimateNumber = (): string => {
  const year = new Date().getFullYear();
  const count = mockData.estimates.filter(e => e.estimate_number?.includes(`EST-${year}`)).length + 1;
  return `EST-${year}-${String(count).padStart(4, '0')}`;
};

export function useMockApi() {
  const fetchApi = async <T,>(endpoint: string, options?: ApiOptions): Promise<T> => {
    const method = options?.method || 'GET';
    const body = options?.body;
    const reqParams = options?.params || {};
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Parse endpoint
    const url = new URL(`http://localhost${endpoint}`);
    const path = url.pathname;
    const params = Object.fromEntries(url.searchParams);
    
    const userId = currentUserId;

    // Dashboard endpoints
    if (path === '/dashboard/stats.php') {
      const invoices = mockData.invoices.filter(i => i.user_id === userId);
      const clients = mockData.clients.filter(c => c.user_id === userId);
      const estimates = mockData.estimates.filter(e => e.user_id === userId);

      const stats: DashboardStats = {
        total_invoices: invoices.reduce((sum, i) => sum + i.total, 0),
        paid_amount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
        pending_amount: invoices.filter(i => ['sent', 'viewed'].includes(i.status)).reduce((sum, i) => sum + i.total, 0),
        overdue_amount: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0),
        invoice_counts: {
          draft: invoices.filter(i => i.status === 'draft').length,
          sent: invoices.filter(i => i.status === 'sent').length,
          viewed: invoices.filter(i => i.status === 'viewed').length,
          paid: invoices.filter(i => i.status === 'paid').length,
          overdue: invoices.filter(i => i.status === 'overdue').length,
          cancelled: invoices.filter(i => i.status === 'cancelled').length
        },
        total_clients: clients.length,
        total_estimates: estimates.length
      };
      return { success: true, stats } as T;
    }

    if (path === '/dashboard/recent-invoices.php') {
      const limit = parseInt(params.limit as string) || 5;
      const invoices = mockData.invoices
        .filter(i => i.user_id === userId)
        .slice(0, limit);
      return { success: true, invoices } as T;
    }

    if (path === '/dashboard/revenue-chart.php') {
      const invoices = mockData.invoices.filter(i => i.user_id === userId && i.status === 'paid');
      const labels: string[] = [];
      const data: number[] = [];
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        labels.push(monthKey);
        
        const monthRevenue = invoices
          .filter(inv => {
            const invDate = new Date(inv.issue_date);
            return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, inv) => sum + inv.total, 0);
        data.push(monthRevenue);
      }
      
      return { success: true, chart: { labels, data } } as T;
    }

    // Clients endpoints
    if (path === '/clients/index.php' && method === 'GET') {
      let clients = [...mockData.clients].filter(c => c.user_id === userId);
      
      if (reqParams.search) {
        const search = String(reqParams.search).toLowerCase();
        clients = clients.filter(c => 
          c.name.toLowerCase().includes(search) || 
          c.email?.toLowerCase().includes(search) ||
          c.phone?.includes(search)
        );
      }
      
      const page = parseInt(reqParams.page as string) || 1;
      const limit = parseInt(reqParams.limit as string) || 20;
      const start = (page - 1) * limit;
      const paginatedClients = clients.slice(start, start + limit);
      
      return { 
        success: true, 
        clients: paginatedClients,
        pagination: {
          page,
          limit,
          total: clients.length,
          pages: Math.ceil(clients.length / limit)
        }
      } as T;
    }

    if (path.startsWith('/clients/detail.php')) {
      const id = parseInt(params.id as string);
      
      if (method === 'GET') {
        const client = mockData.clients.find(c => c.id === id);
        if (client) {
          const invoices = mockData.invoices
            .filter(i => i.client_id === id)
            .slice(0, 10);
          return { success: true, client, invoices } as T;
        }
        return { success: false, error: 'Client not found' } as T;
      }
      
      if (method === 'PUT') {
        const index = mockData.clients.findIndex(c => c.id === id);
        if (index >= 0) {
          mockData.clients[index] = { ...mockData.clients[index], ...body };
          return { success: true, client: mockData.clients[index] } as T;
        }
        return { success: false, error: 'Client not found' } as T;
      }
      
      if (method === 'DELETE') {
        const index = mockData.clients.findIndex(c => c.id === id);
        if (index >= 0) {
          mockData.clients.splice(index, 1);
          return { success: true, message: 'Client deleted' } as T;
        }
        return { success: false, error: 'Client not found' } as T;
      }
    }

    if (path === '/clients/index.php' && method === 'POST') {
      const newClient: Client = {
        id: getNextId(mockData.clients),
        user_id: userId,
        ...body
      };
      mockData.clients.push(newClient);
      return { success: true, client: newClient } as T;
    }

    // Invoices endpoints
    if (path === '/invoices/index.php' && method === 'GET') {
      let invoices = [...mockData.invoices].filter(i => i.user_id === userId);
      
      if (reqParams.status) {
        invoices = invoices.filter(i => i.status === reqParams.status);
      }
      if (reqParams.client_id) {
        invoices = invoices.filter(i => i.client_id === parseInt(reqParams.client_id as string));
      }
      if (reqParams.search) {
        const search = String(reqParams.search).toLowerCase();
        invoices = invoices.filter(i => 
          i.invoice_number?.toLowerCase().includes(search) || 
          i.client_name?.toLowerCase().includes(search)
        );
      }
      
      const page = parseInt(reqParams.page as string) || 1;
      const limit = parseInt(reqParams.limit as string) || 20;
      const start = (page - 1) * limit;
      const paginatedInvoices = invoices.slice(start, start + limit);
      
      return { 
        success: true, 
        invoices: paginatedInvoices,
        pagination: {
          page,
          limit,
          total: invoices.length,
          pages: Math.ceil(invoices.length / limit)
        }
      } as T;
    }

    if (path.startsWith('/invoices/detail.php')) {
      const id = parseInt(params.id as string);
      
      if (method === 'GET') {
        const invoice = mockData.invoices.find(i => i.id === id);
        if (invoice) {
          return { success: true, invoice } as T;
        }
        return { success: false, error: 'Invoice not found' } as T;
      }
      
      if (method === 'PUT') {
        const index = mockData.invoices.findIndex(i => i.id === id);
        if (index >= 0) {
          mockData.invoices[index] = { ...mockData.invoices[index], ...body };
          return { success: true, invoice: mockData.invoices[index] } as T;
        }
        return { success: false, error: 'Invoice not found' } as T;
      }
      
      if (method === 'DELETE') {
        const index = mockData.invoices.findIndex(i => i.id === id);
        if (index >= 0) {
          mockData.invoices.splice(index, 1);
          return { success: true, message: 'Invoice deleted' } as T;
        }
        return { success: false, error: 'Invoice not found' } as T;
      }
    }

    if (path === '/invoices/index.php' && method === 'POST') {
      const client = mockData.clients.find(c => c.id === body.client_id);
      
      const newInvoice: Invoice = {
        id: getNextId(mockData.invoices),
        user_id: userId,
        client_id: body.client_id,
        client_name: client?.name || '',
        client_email: client?.email || '',
        client_phone: client?.phone || '',
        invoice_number: generateInvoiceNumber(),
        issue_date: body.issue_date,
        due_date: body.due_date,
        status: body.status || 'draft',
        subtotal: body.subtotal,
        tax_rate: body.tax_rate,
        tax_amount: body.tax_amount,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        discount_amount: body.discount_amount,
        total: body.total,
        notes: body.notes || '',
        terms: body.terms || '',
        items: body.items?.map((item: InvoiceItem, idx: number) => ({
          id: idx + 1,
          invoice_id: getNextId(mockData.invoices),
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        })) || []
      };
      
      mockData.invoices.push(newInvoice);
      return { success: true, invoice: newInvoice } as T;
    }

    // Estimates endpoints
    if (path === '/estimates/index.php' && method === 'GET') {
      let estimates = [...mockData.estimates].filter(e => e.user_id === userId);
      
      if (reqParams.status) {
        estimates = estimates.filter(e => e.status === reqParams.status);
      }
      
      const page = parseInt(reqParams.page as string) || 1;
      const limit = parseInt(reqParams.limit as string) || 20;
      const start = (page - 1) * limit;
      
      return { 
        success: true, 
        estimates: estimates.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: estimates.length,
          pages: Math.ceil(estimates.length / limit)
        }
      } as T;
    }

    if (path.startsWith('/estimates/detail.php')) {
      const id = parseInt(params.id as string);
      
      if (method === 'GET') {
        const estimate = mockData.estimates.find(e => e.id === id);
        if (estimate) {
          return { success: true, estimate } as T;
        }
        return { success: false, error: 'Estimate not found' } as T;
      }
      
      if (method === 'PUT') {
        const index = mockData.estimates.findIndex(e => e.id === id);
        if (index >= 0) {
          mockData.estimates[index] = { ...mockData.estimates[index], ...body };
          return { success: true, estimate: mockData.estimates[index] } as T;
        }
        return { success: false, error: 'Estimate not found' } as T;
      }
      
      if (method === 'DELETE') {
        const index = mockData.estimates.findIndex(e => e.id === id);
        if (index >= 0) {
          mockData.estimates.splice(index, 1);
          return { success: true, message: 'Estimate deleted' } as T;
        }
        return { success: false, error: 'Estimate not found' } as T;
      }
      
      if (method === 'POST' && params.action === 'convert') {
        const estimate = mockData.estimates.find(e => e.id === id);
        if (estimate) {
          const client = mockData.clients.find(c => c.id === estimate.client_id);
          
          const newInvoice: Invoice = {
            id: getNextId(mockData.invoices),
            user_id: userId,
            client_id: estimate.client_id,
            client_name: client?.name || '',
            client_email: client?.email || '',
            invoice_number: generateInvoiceNumber(),
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'draft',
            subtotal: estimate.subtotal,
            tax_rate: estimate.tax_rate,
            tax_amount: estimate.tax_amount,
            discount_amount: estimate.discount_amount,
            total: estimate.total,
            notes: estimate.notes || '',
            terms: 'Payment due within 30 days.',
            items: estimate.items?.map((item: EstimateItem, idx: number) => ({
              id: idx + 1,
              invoice_id: getNextId(mockData.invoices),
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount
            })) || []
          };
          
          mockData.invoices.push(newInvoice);
          
          const estIndex = mockData.estimates.findIndex(e => e.id === id);
          if (estIndex >= 0) {
            mockData.estimates[estIndex].status = 'converted';
          }
          
          return { success: true, invoice: newInvoice } as T;
        }
        return { success: false, error: 'Estimate not found' } as T;
      }
    }

    if (path === '/estimates/index.php' && method === 'POST') {
      const client = mockData.clients.find(c => c.id === body.client_id);
      
      const newEstimate: Estimate = {
        id: getNextId(mockData.estimates),
        user_id: userId,
        client_id: body.client_id,
        client_name: client?.name || '',
        client_email: client?.email || '',
        estimate_number: generateEstimateNumber(),
        issue_date: body.issue_date,
        valid_until: body.valid_until,
        status: body.status || 'draft',
        subtotal: body.subtotal,
        tax_rate: body.tax_rate,
        tax_amount: body.tax_amount,
        discount_amount: body.discount_amount,
        total: body.total,
        notes: body.notes || '',
        items: body.items?.map((item: EstimateItem, idx: number) => ({
          id: idx + 1,
          estimate_id: getNextId(mockData.estimates),
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        })) || []
      };
      
      mockData.estimates.push(newEstimate);
      return { success: true, estimate: newEstimate } as T;
    }

    // Items endpoints
    if (path === '/items/index.php' && method === 'GET') {
      let items = [...mockData.items].filter(i => i.user_id === userId);
      
      if (reqParams.search) {
        const search = String(reqParams.search).toLowerCase();
        items = items.filter(i => 
          i.name.toLowerCase().includes(search) || 
          i.description?.toLowerCase().includes(search)
        );
      }
      
      return { success: true, items } as T;
    }

    if (path.startsWith('/items/detail.php')) {
      const id = parseInt(params.id as string);
      
      if (method === 'PUT') {
        const index = mockData.items.findIndex(i => i.id === id);
        if (index >= 0) {
          mockData.items[index] = { ...mockData.items[index], ...body };
          return { success: true, item: mockData.items[index] } as T;
        }
        return { success: false, error: 'Item not found' } as T;
      }
      
      if (method === 'DELETE') {
        const index = mockData.items.findIndex(i => i.id === id);
        if (index >= 0) {
          mockData.items.splice(index, 1);
          return { success: true, message: 'Item deleted' } as T;
        }
        return { success: false, error: 'Item not found' } as T;
      }
    }

    if (path === '/items/index.php' && method === 'POST') {
      const newItem: SavedItem = {
        id: getNextId(mockData.items),
        user_id: userId,
        ...body
      };
      mockData.items.push(newItem);
      return { success: true, item: newItem } as T;
    }

    // Reports endpoints
    if (path === '/reports/index.php') {
      const reportType = params.type;
      
      if (reportType === 'revenue') {
        const invoices = mockData.invoices.filter(i => i.user_id === userId);
        const data = [];
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleString('en-US', { month: 'short' });
          
          const monthInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.issue_date);
            return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
          });
          
          data.push({
            month: monthName,
            paid: monthInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
            pending: monthInvoices.filter(inv => ['sent', 'viewed'].includes(inv.status)).reduce((sum, inv) => sum + inv.total, 0),
            overdue: monthInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0)
          });
        }
        
        return { success: true, data } as T;
      }
      
      if (reportType === 'invoice-status') {
        const invoices = mockData.invoices.filter(i => i.user_id === userId);
        const statuses = ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'];
        const data = statuses.map(status => ({
          status,
          count: invoices.filter(i => i.status === status).length,
          total: invoices.filter(i => i.status === status).reduce((sum, i) => sum + i.total, 0)
        })).filter(d => d.count > 0);
        
        return { success: true, data } as T;
      }
      
      if (reportType === 'top-clients') {
        const clients = mockData.clients.filter(c => c.user_id === userId);
        const invoices = mockData.invoices.filter(i => i.user_id === userId && i.status === 'paid');
        
        const data = clients.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email,
          invoice_count: invoices.filter(i => i.client_id === client.id).length,
          total_revenue: invoices.filter(i => i.client_id === client.id).reduce((sum, i) => sum + i.total, 0)
        })).sort((a, b) => b.total_revenue - a.total_revenue).slice(0, parseInt(params.limit as string) || 10);
        
        return { success: true, data } as T;
      }
      
      if (reportType === 'yearly-summary') {
        const year = parseInt(params.year as string) || new Date().getFullYear();
        const invoices = mockData.invoices.filter(i => {
          const invYear = new Date(i.issue_date).getFullYear();
          return i.user_id === userId && invYear === year;
        });
        const estimates = mockData.estimates.filter(e => {
          const estYear = new Date(e.issue_date).getFullYear();
          return e.user_id === userId && estYear === year;
        });
        const clients = mockData.clients.filter(c => {
          return c.user_id === userId;
        });
        
        return { 
          success: true, 
          data: {
            invoices: {
              count: invoices.length,
              total: invoices.reduce((sum, i) => sum + i.total, 0)
            },
            paid_amount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
            estimates: {
              count: estimates.length,
              total: estimates.reduce((sum, e) => sum + e.total, 0)
            },
            new_clients: clients.length
          }
        } as T;
      }
    }

    return { success: false, error: 'Endpoint not found' } as T;
  };

  return { fetchApi };
}
