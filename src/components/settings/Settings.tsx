import { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { toast } from 'sonner';
import {
  User,
  Building2,
  Lock,
  ChevronRight,
  LogOut,
  Trash2,
  Globe,
  Sun,
  MoreHorizontal,
  Mic,
  Users,
  CreditCard,
  Percent,
  HelpCircle,
  Briefcase,
  Bell,
  Mail,
  Clock,
  FileText,
  ExternalLink,
  Plus,
  Crown,
  Check,
  Play,
  X,
  Sparkles,
  ArrowLeft,
  Camera,
  CheckCircle2,
} from 'lucide-react';

type SettingsView = 'main' | 'account' | 'app' | 'team' | 'payment' | 'tax' | 'support' | 'more' | 'business' | 'whatsnew';

const videoTutorials = [
  { id: 1, title: 'Welcome to InvoicePro', thumbnail: 'bg-blue-500' },
  { id: 2, title: 'Business Configuration', thumbnail: 'bg-green-500' },
  { id: 3, title: 'Create an Invoice', thumbnail: 'bg-purple-500' },
  { id: 4, title: 'Customization', thumbnail: 'bg-orange-500' },
  { id: 5, title: 'Payments', thumbnail: 'bg-pink-500' },
  { id: 6, title: 'Tax Settings', thumbnail: 'bg-cyan-500' },
];

export function Settings() {
  const { user, logout } = useAuth();
  const { currentBusiness, businesses, switchBusiness, addBusiness, updateBusiness } = useBusiness();
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddBusinessDialogOpen, setIsAddBusinessDialogOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);

  // Settings states
  const [settings, setSettings] = useState({
    stripeEnabled: true,
    paypalEnabled: true,
    allowTips: false,
    applyWithholding: false,
    convertToQuote: false,
    language: 'English',
    theme: 'Light',
    invoiceGrouping: 'Creation date',
  });

  // New business form
  const [newBusinessForm, setNewBusinessForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    taxRate: '8.875',
    taxLabel: 'TAX',
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not available in demo mode');
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Team member invitation sent');
    setIsAddUserDialogOpen(false);
  };

  const handleAddBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    addBusiness({
      name: newBusinessForm.name,
      email: newBusinessForm.email,
      phone: newBusinessForm.phone,
      address: newBusinessForm.address,
      city: newBusinessForm.city,
      state: newBusinessForm.state,
      zip: newBusinessForm.zip,
      country: newBusinessForm.country,
      taxRate: parseFloat(newBusinessForm.taxRate),
      taxLabel: newBusinessForm.taxLabel,
      currency: 'USD',
    });
    toast.success(`Business "${newBusinessForm.name}" created successfully`);
    setIsAddBusinessDialogOpen(false);
    setNewBusinessForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
      taxRate: '8.875',
      taxLabel: 'TAX',
    });
  };

  const handleSwitchBusiness = (businessId: string) => {
    switchBusiness(businessId);
    toast.success('Business switched successfully');
  };

  // Main Settings Menu
  if (currentView === 'main') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1f1f1f]">Settings</h1>
          <p className="text-[#5d6c7b] mt-1">Manage your account and preferences</p>
        </div>

        {/* Current Business Card */}
        <Card className="bg-gradient-to-r from-[#0082f3] to-[#2895f7] text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm">Current Business</p>
                <h2 className="text-2xl font-bold text-white">{currentBusiness.name}</h2>
                <p className="text-white/80 text-sm">{currentBusiness.email}</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">Invoices</p>
                <p className="text-2xl font-bold text-white">{currentBusiness.invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Account Section */}
          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Account</h3>
            <Card>
              <CardContent className="p-0">
                <button
                  onClick={() => setCurrentView('account')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#1f1f1f]">Account</p>
                      <p className="text-sm text-[#5d6c7b]">{user?.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>

                <button
                  onClick={() => setCurrentView('team')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#1f1f1f]">My Team</p>
                      <p className="text-sm text-[#5d6c7b]">Manage team members</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>

                <button
                  onClick={() => setIsWhatsNewOpen(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#1f1f1f]">What's New</p>
                      <p className="text-sm text-[#5d6c7b]">Latest updates and features</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Business Section */}
          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Business</h3>
            <Card>
              <CardContent className="p-0">
                <button
                  onClick={() => setCurrentView('business')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#1f1f1f]">Business Info</p>
                      <p className="text-sm text-[#5d6c7b]">Company details and logo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>

                <button
                  onClick={() => setCurrentView('payment')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#1f1f1f]">Payment Options</p>
                      <p className="text-sm text-[#5d6c7b]">Stripe, PayPal, and more</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>

                <button
                  onClick={() => setCurrentView('tax')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Percent className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#1f1f1f]">Tax, Currency & Others</p>
                      <p className="text-sm text-[#5d6c7b]">Tax rates and currency settings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* App Section */}
          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">App</h3>
            <Card>
              <CardContent className="p-0">
                <button
                  onClick={() => setCurrentView('app')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                      <Sun className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#1f1f1f]">App Settings</p>
                      <p className="text-sm text-[#5d6c7b]">Language, theme, and more</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>

                <button
                  onClick={() => setCurrentView('more')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <MoreHorizontal className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#1f1f1f]">More Options</p>
                      <p className="text-sm text-[#5d6c7b]">Email, reminders, notifications</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>

                <button
                  onClick={() => setCurrentView('support')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#1f1f1f]">Customer Support</p>
                      <p className="text-sm text-[#5d6c7b]">Help, FAQs, and tutorials</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What's New Dialog */}
        <Dialog open={isWhatsNewOpen} onOpenChange={setIsWhatsNewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                What's New
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-[#5d6c7b]">
                <span>Version 2.16.0</span>
                <span>2 months ago</span>
              </div>
              <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl p-6 text-white">
                <div className="aspect-video bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-6xl mb-2">💰</div>
                    <p className="font-semibold">TIP RECEIVED</p>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Tipping: Turn Appreciation into Revenue</h3>
                <p className="text-sm text-white/80">
                  Your customers already love your service—give them a way to show it. 
                  Turn appreciation into revenue with our new Tipping feature. 
                  Activate it with a click—Stripe or PayPal required.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Business Info / Switch Business View
  if (currentView === 'business') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Choose Business</h1>
        </div>

        <div className="space-y-4">
          {businesses.map((business) => (
            <Card
              key={business.id}
              className={`cursor-pointer transition-all ${
                business.id === currentBusiness.id 
                  ? 'ring-2 ring-[#0082f3] bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSwitchBusiness(business.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0082f3] to-[#2895f7] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1f1f1f]">{business.name}</p>
                    <p className="text-sm text-[#5d6c7b]">{business.email}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-[#5d6c7b]">{business.invoices.length} invoices</span>
                      <span className="text-xs text-[#5d6c7b]">{business.clients.length} clients</span>
                    </div>
                  </div>
                  {business.id === currentBusiness.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#0082f3] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-[#0082f3] font-medium">Active</span>
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => setIsAddBusinessDialogOpen(true)}
          className="w-full bg-[#0082f3] hover:bg-[#0082f3]/90 h-12"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Business
        </Button>

        {/* Add Business Dialog */}
        <Dialog open={isAddBusinessDialogOpen} onOpenChange={setIsAddBusinessDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Business</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBusiness} className="space-y-4 mt-4">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={newBusinessForm.name}
                  onChange={(e) => setNewBusinessForm({ ...newBusinessForm, name: e.target.value })}
                  placeholder="Enter business name"
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newBusinessForm.email}
                  onChange={(e) => setNewBusinessForm({ ...newBusinessForm, email: e.target.value })}
                  placeholder="business@email.com"
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newBusinessForm.phone}
                  onChange={(e) => setNewBusinessForm({ ...newBusinessForm, phone: e.target.value })}
                  placeholder="+1 555-0000"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={newBusinessForm.address}
                  onChange={(e) => setNewBusinessForm({ ...newBusinessForm, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={newBusinessForm.city}
                    onChange={(e) => setNewBusinessForm({ ...newBusinessForm, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={newBusinessForm.state}
                    onChange={(e) => setNewBusinessForm({ ...newBusinessForm, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ZIP</Label>
                  <Input
                    value={newBusinessForm.zip}
                    onChange={(e) => setNewBusinessForm({ ...newBusinessForm, zip: e.target.value })}
                    placeholder="ZIP code"
                  />
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={newBusinessForm.taxRate}
                    onChange={(e) => setNewBusinessForm({ ...newBusinessForm, taxRate: e.target.value })}
                    placeholder="8.875"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#0082f3]">
                Create Business
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Account View
  if (currentView === 'account') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Account</h1>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Sign In Method</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#5d6c7b]">Email</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1f1f1f]">{user?.email}</span>
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span className="text-[#1f1f1f]">Change account email</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-500" />
                  <span className="text-[#1f1f1f]">Reset password</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-cyan-500" />
                  <span className="text-[#1f1f1f]">Log out</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
              </button>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Danger Zone</h3>
            <Card className="border-red-200">
              <CardContent className="p-0">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <span className="text-red-600">Delete Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // My Team View
  if (currentView === 'team') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">My Team</h1>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#1f1f1f]">{user?.email?.split('@')[0] || 'Owner'}</p>
                  <p className="text-sm text-[#5d6c7b]">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    Owner
                  </span>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5 text-[#aaadb0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={() => setIsAddUserDialogOpen(true)}
          className="w-full bg-[#0082f3] hover:bg-[#0082f3]/90 h-12"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New User
        </Button>

        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTeamMember} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="team@company.com" required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select defaultValue="member">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Team Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-[#0082f3]">
                Send Invitation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Payment Options View
  if (currentView === 'payment') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Payment Options</h1>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Online Payments</h3>
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      S
                    </div>
                    <div>
                      <p className="font-medium text-[#1f1f1f]">Stripe</p>
                      <p className="text-sm text-[#5d6c7b]">Accept online payments</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.stripeEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, stripeEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      P
                    </div>
                    <div>
                      <p className="font-medium text-[#1f1f1f]">Paypal</p>
                      <p className="text-sm text-[#5d6c7b]">Accept online payments</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.paypalEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, paypalEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Tips</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1f1f1f]">Allow clients to leave a tip</p>
                    <p className="text-sm text-[#5d6c7b]">
                      Let customers leave a tip when paying invoices through Stripe or Paypal
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowTips}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowTips: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Tax, Currency & Others View
  if (currentView === 'tax') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Tax, Currency & Others</h1>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Location</h3>
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="text-[#1f1f1f]">Country</span>
                  <span className="text-[#5d6c7b]">{currentBusiness.country}</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-[#1f1f1f]">Currency</span>
                  <span className="text-[#5d6c7b]">{currentBusiness.currency}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Tax</h3>
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="text-[#1f1f1f]">Type</span>
                  <span className="text-[#0082f3]">On the total</span>
                </div>
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="text-[#1f1f1f]">Label</span>
                  <span className="text-[#5d6c7b]">{currentBusiness.taxLabel}</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-[#1f1f1f]">Rate</span>
                  <span className="text-[#5d6c7b]">{currentBusiness.taxRate}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Withholding</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#1f1f1f]">Apply withholding tax</span>
                  <Switch
                    checked={settings.applyWithholding}
                    onCheckedChange={(checked) => setSettings({ ...settings, applyWithholding: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // App Settings View
  if (currentView === 'app') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">App Settings</h1>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-lime-500" />
                  <span className="text-[#1f1f1f]">Language</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#5d6c7b]">{settings.language}</span>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-blue-500" />
                  <span className="text-[#1f1f1f]">App theme</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-[#aaadb0]" />
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </div>
              </button>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">AI Assistant</h3>
            <Card>
              <CardContent className="p-0">
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-gray-500" />
                    <span className="text-[#1f1f1f]">Voice settings</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // More Options View
  if (currentView === 'more') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">More Options</h1>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Client Communications</h3>
            <Card>
              <CardContent className="p-0">
                <button className="w-full flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="text-[#1f1f1f]">Email Settings</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span className="text-[#1f1f1f]">Payment Reminders</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Estimates</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#1f1f1f]">Convert to Quote</span>
                  <Switch
                    checked={settings.convertToQuote}
                    onCheckedChange={(checked) => setSettings({ ...settings, convertToQuote: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Other</h3>
            <Card>
              <CardContent className="p-0">
                <button className="w-full flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <span className="text-[#1f1f1f]">Notifications</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <span className="text-[#1f1f1f]">Trash</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Customer Support View
  if (currentView === 'support') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1f1f1f]">Customer Support</h1>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Contact us</h3>
            <Card>
              <CardContent className="p-0">
                <button className="w-full flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">🐛</span>
                    </div>
                    <span className="text-[#1f1f1f]">Report an issue</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[#1f1f1f]">Suggest a feature</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#aaadb0]" />
                </button>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#5d6c7b] mb-2 px-1">Video Tutorials</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {videoTutorials.map((video) => (
                    <div key={video.id} className="flex-shrink-0 w-32">
                      <div className={`aspect-video ${video.thumbnail} rounded-lg flex items-center justify-center mb-2 relative`}>
                        <div className="absolute top-1 left-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {video.id}
                        </div>
                        <Play className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-xs text-[#1f1f1f] line-clamp-2">{video.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
