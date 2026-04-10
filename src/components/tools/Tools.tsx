import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  Receipt, 
  Clock, 
  Download, 
  Sparkles, 
  Repeat,
  Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tools = [
  {
    id: 'items',
    name: 'Manage Items',
    description: 'Save your frequent items that you invoice',
    icon: Package,
    color: 'bg-green-500',
    pro: false,
    route: '/tools/items'
  },
  {
    id: 'expenses',
    name: 'Expenses',
    description: 'Scan your receipts and save all your expenses',
    icon: Receipt,
    color: 'bg-blue-500',
    pro: false,
    route: '/tools/expenses'
  },
  {
    id: 'time-tracking',
    name: 'Client Time Tracking',
    description: 'Track time spent on client\'s work',
    icon: Clock,
    color: 'bg-orange-500',
    pro: true,
    route: '/tools/time-tracking'
  },
  {
    id: 'import-export',
    name: 'Import & Export Data',
    description: 'Upload items and clients. Export invoices in different formats',
    icon: Download,
    color: 'bg-purple-500',
    pro: false,
    route: '/tools/import-export'
  },
  {
    id: 'logo-ai',
    name: 'Logo Maker & AI',
    description: 'Ask anything to the AI assistant',
    icon: Sparkles,
    color: 'bg-pink-500',
    pro: false,
    route: '/tools/logo-ai'
  },
  {
    id: 'recurring',
    name: 'Recurring Invoices',
    description: 'Create or send Recurring Invoices automatically',
    icon: Repeat,
    color: 'bg-indigo-500',
    pro: false,
    route: '/tools/recurring'
  }
];

export function Tools() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1f1f1f]">Tools</h1>
          <p className="text-[#5d6c7b] mt-1">Powerful tools to manage your business</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <Crown className="w-4 h-4" />
          PRO
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(tool.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1f1f1f]">{tool.name}</h3>
                      {tool.pro && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#5d6c7b] mt-1">{tool.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
