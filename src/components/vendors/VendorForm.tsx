import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Building2, Upload, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Vendor } from '@/types';

export function VendorForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBusiness, addVendor, updateVendor } = useBusiness();
  const isEditing = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    notes: '',
    profileImage: '',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const vendor = currentBusiness.vendors.find(v => v.id === Number(id));
      if (vendor) {
        setFormData({
          name: vendor.name,
          companyName: vendor.companyName || '',
          email: vendor.email || '',
          phone: vendor.phone || '',
          address: vendor.address || '',
          city: vendor.city || '',
          state: vendor.state || '',
          zip: vendor.zip || '',
          country: vendor.country || '',
          notes: vendor.notes || '',
          profileImage: vendor.profileImage || '',
        });
      }
    }
  }, [id, currentBusiness.vendors, isEditing]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vendorData: Vendor = {
      id: isEditing ? Number(id) : Date.now(),
      ...formData,
      documents: [],
      created_at: new Date().toISOString(),
    };

    if (isEditing) {
      updateVendor(Number(id), vendorData);
    } else {
      addVendor(vendorData);
    }

    navigate('/vendors');
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      navigate('/vendors');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#1f1f1f]">
            {isEditing ? t('vendors.editVendor') : t('vendors.newVendor')}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('vendors.vendorImage')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0082f3] to-[#2895f7] rounded-xl flex items-center justify-center text-white font-medium text-2xl overflow-hidden">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8" />
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('common.upload')}
                </Button>
                {formData.profileImage && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleChange('profileImage', '')}
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t('common.remove')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('vendors.vendorInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('common.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Vendor name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">{t('vendors.companyName')}</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('common.phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 555-0000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('common.address')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">{t('common.address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t('common.city')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{t('common.state')}</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">{t('common.zip')}</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleChange('zip', e.target.value)}
                  placeholder="ZIP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t('common.country')}</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('common.notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes..."
              className="w-full min-h-[100px] p-3 border border-[#e9e9e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0082f3] focus:border-transparent resize-none"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleBack}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="bg-[#0082f3] hover:bg-[#2895f7]">
            {isEditing ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>

      {/* Discard Changes Dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.cancel')}</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
              {t('common.no')}
            </Button>
            <Button variant="destructive" onClick={() => navigate('/vendors')}>
              {t('common.yes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
