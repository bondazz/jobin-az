import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Save,
  Globe,
  Search,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

interface SiteSetting {
  key: string;
  value: any;
  description?: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<{ [key: string]: any }>({
    site_title: '',
    site_description: '',
    site_logo: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    social_linkedin: '',
    seo_meta_title: '',
    seo_meta_description: '',
    seo_meta_keywords: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      navigate('/admin/login');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settingsObj: { [key: string]: any } = {};
      data?.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });

      setSettings(prevSettings => ({ ...prevSettings, ...settingsObj }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Xəta',
        description: 'Tənzimləmələri yükləyərkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Prepare upsert operations for all settings
      const upsertPromises = Object.entries(settings).map(([key, value]) => 
        supabase
          .from('site_settings')
          .upsert({
            key,
            value,
            description: getSettingDescription(key)
          }, {
            onConflict: 'key'
          })
      );

      await Promise.all(upsertPromises);
      
      toast({
        title: 'Uğurlu',
        description: 'Tənzimləmələr uğurla saxlanıldı.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Xəta',
        description: 'Tənzimləmələri saxlayarkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: { [key: string]: string } = {
      site_title: 'Saytın əsas başlığı',
      site_description: 'Saytın təsviri',
      site_logo: 'Saytın loqosu URL',
      contact_email: 'Əlaqə email adresi',
      contact_phone: 'Əlaqə telefon nömrəsi',
      contact_address: 'Əlaqə ünvanı',
      social_facebook: 'Facebook profil linki',
      social_twitter: 'Twitter profil linki',
      social_instagram: 'Instagram profil linki',
      social_linkedin: 'LinkedIn profil linki',
      seo_meta_title: 'Əsas SEO başlıq',
      seo_meta_description: 'Əsas SEO təsvir',
      seo_meta_keywords: 'Əsas SEO açar sözlər',
    };
    return descriptions[key] || '';
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Sayt Tənzimləmələri</h1>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saxlanılır...' : 'Saxla'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Site Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Sayt Məlumatları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_title">Sayt Başlığı</Label>
                  <Input
                    id="site_title"
                    value={settings.site_title || ''}
                    onChange={(e) => handleInputChange('site_title', e.target.value)}
                    placeholder="İş Portalı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_logo">Loqo URL</Label>
                  <Input
                    id="site_logo"
                    type="url"
                    value={settings.site_logo || ''}
                    onChange={(e) => handleInputChange('site_logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_description">Sayt Təsviri</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description || ''}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  rows={3}
                  placeholder="Ən yaxşı iş imkanları burada..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Əlaqə Məlumatları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email || ''}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      placeholder="info@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefon</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact_phone"
                      value={settings.contact_phone || ''}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="+994 12 345 67 89"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_address">Ünvan</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact_address"
                    value={settings.contact_address || ''}
                    onChange={(e) => handleInputChange('contact_address', e.target.value)}
                    placeholder="Bakı, Azərbaycan"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5" />
                Sosial Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="social_facebook">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="social_facebook"
                      type="url"
                      value={settings.social_facebook || ''}
                      onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_twitter">Twitter</Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="social_twitter"
                      type="url"
                      value={settings.social_twitter || ''}
                      onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="social_instagram">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="social_instagram"
                      type="url"
                      value={settings.social_instagram || ''}
                      onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_linkedin">LinkedIn</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="social_linkedin"
                      type="url"
                      value={settings.social_linkedin || ''}
                      onChange={(e) => handleInputChange('social_linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/yourcompany"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO Tənzimləmələri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="seo_meta_title">Meta Başlıq</Label>
                <Input
                  id="seo_meta_title"
                  value={settings.seo_meta_title || ''}
                  onChange={(e) => handleInputChange('seo_meta_title', e.target.value)}
                  placeholder="İş Portalı - Ən yaxşı iş imkanları"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo_meta_description">Meta Təsvir</Label>
                <Textarea
                  id="seo_meta_description"
                  value={settings.seo_meta_description || ''}
                  onChange={(e) => handleInputChange('seo_meta_description', e.target.value)}
                  rows={3}
                  placeholder="Azərbaycanda ən yaxşı iş imkanlarını kəşf edin..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo_meta_keywords">Meta Açar Sözlər</Label>
                <Textarea
                  id="seo_meta_keywords"
                  value={settings.seo_meta_keywords || ''}
                  onChange={(e) => handleInputChange('seo_meta_keywords', e.target.value)}
                  rows={2}
                  placeholder="iş, vakansiya, karyera, azərbaycan, bakı, iş elanları"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saxlanılır...' : 'Bütün Tənzimləmələri Saxla'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}