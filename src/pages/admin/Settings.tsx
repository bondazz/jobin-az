import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import ImageUpload from '@/components/ImageUpload';
import { 
  Save,
  Globe,
  Search,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Sun,
  Moon,
  DollarSign,
  Info,
  Edit3,
  Image,
  Contact
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
    site_logo_light: '',
    site_logo_dark: '',
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
  
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [pricingFeatures, setPricingFeatures] = useState<any[]>([]);
  const [aboutContent, setAboutContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchSettings();
    fetchPricingData();
    fetchAboutContent();
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

  const fetchPricingData = async () => {
    try {
      const [plansResponse, featuresResponse] = await Promise.all([
        supabase.from('pricing_plans').select('*').order('display_order'),
        supabase.from('pricing_features').select('*').order('category, display_order')
      ]);

      if (plansResponse.error) throw plansResponse.error;
      if (featuresResponse.error) throw featuresResponse.error;

      setPricingPlans(plansResponse.data || []);
      setPricingFeatures(featuresResponse.data || []);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast({
        title: 'Xəta',
        description: 'Qiymət məlumatlarını yükləyərkən xəta baş verdi.',
        variant: 'destructive',
      });
    }
  };

  const fetchAboutContent = async () => {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setAboutContent(data || []);
    } catch (error) {
      console.error('Error fetching about content:', error);
      toast({
        title: 'Xəta',
        description: 'Haqqında məlumatlarını yükləyərkən xəta baş verdi.',
        variant: 'destructive',
      });
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
      site_logo_light: 'Gündüz rejimi üçün sayt loqosu',
      site_logo_dark: 'Gecə rejimi üçün sayt loqosu',
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
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Sayt Tənzimləmələri</h1>
        </div>

        <Tabs defaultValue="site" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="site" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Sayt
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Contact className="w-4 h-4" />
              Əlaqə
            </TabsTrigger>
            <TabsTrigger value="logos" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Logoları
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Qiymətlər
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Haqqında
            </TabsTrigger>
          </TabsList>

          {/* Site Information */}
          <TabsContent value="site" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Sayt Məlumatları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  <Label htmlFor="site_description">Sayt Təsviri</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description || ''}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                    rows={3}
                    placeholder="Ən yaxşı iş imkanları burada..."
                  />
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saxlanılır...' : 'Saxla'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information */}
          <TabsContent value="contact" className="space-y-6">
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

                {/* Social Media */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Sosial Media</h3>
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
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saxlanılır...' : 'Saxla'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logo Upload */}
          <TabsContent value="logos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Sayt Loqoları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Light Mode Logo */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <Label className="text-sm font-medium">Gündüz Rejimi Loqosu</Label>
                    </div>
                    <ImageUpload
                      value={settings.site_logo_light || ''}
                      onChange={(url) => handleInputChange('site_logo_light', url)}
                      label=""
                      placeholder="Gündüz rejimi üçün loqo yükləyin"
                      className="w-full"
                    />
                  </div>

                  {/* Dark Mode Logo */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="h-4 w-4 text-blue-400" />
                      <Label className="text-sm font-medium">Gecə Rejimi Loqosu</Label>
                    </div>
                    <ImageUpload
                      value={settings.site_logo_dark || ''}
                      onChange={(url) => handleInputChange('site_logo_dark', url)}
                      label=""
                      placeholder="Gecə rejimi üçün loqo yükləyin"
                      className="w-full"
                    />
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saxlanılır...' : 'Saxla'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo" className="space-y-6">
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

                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saxlanılır...' : 'Saxla'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Management */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Qiymət Planları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricingPlans.map((plan) => (
                  <Card key={plan.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      <Badge variant={plan.is_popular ? "default" : "outline"}>
                        {plan.is_popular ? "Populyar" : "Normal"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Qiymət</Label>
                        <Input 
                          value={plan.price} 
                          onChange={(e) => {
                            const updated = pricingPlans.map(p => 
                              p.id === plan.id ? {...p, price: e.target.value} : p
                            );
                            setPricingPlans(updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Müddət</Label>
                        <Input 
                          value={plan.period} 
                          onChange={(e) => {
                            const updated = pricingPlans.map(p => 
                              p.id === plan.id ? {...p, period: e.target.value} : p
                            );
                            setPricingPlans(updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label>İkon</Label>
                        <Select 
                          value={plan.icon} 
                          onValueChange={(value) => {
                            const updated = pricingPlans.map(p => 
                              p.id === plan.id ? {...p, icon: value} : p
                            );
                            setPricingPlans(updated);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Star">Star</SelectItem>
                            <SelectItem value="Zap">Zap</SelectItem>
                            <SelectItem value="Crown">Crown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Xüsusiyyətlər</Label>
                      <Textarea 
                        value={plan.features?.join('\n') || ''} 
                        onChange={(e) => {
                          const updated = pricingPlans.map(p => 
                            p.id === plan.id ? {...p, features: e.target.value.split('\n').filter(f => f.trim())} : p
                          );
                          setPricingPlans(updated);
                        }}
                        placeholder="Hər sətirdə bir xüsusiyyət"
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Switch 
                        checked={plan.is_popular} 
                        onCheckedChange={(checked) => {
                          const updated = pricingPlans.map(p => 
                            p.id === plan.id ? {...p, is_popular: checked} : p
                          );
                          setPricingPlans(updated);
                        }}
                      />
                      <Label>Populyar plan</Label>
                    </div>
                  </Card>
                ))}
                <Button 
                  onClick={async () => {
                    setSaving(true);
                    try {
                      for (const plan of pricingPlans) {
                        await supabase
                          .from('pricing_plans')
                          .update({
                            name: plan.name,
                            price: plan.price,
                            period: plan.period,
                            description: plan.description,
                            features: plan.features,
                            icon: plan.icon,
                            is_popular: plan.is_popular
                          })
                          .eq('id', plan.id);
                      }
                      toast({
                        title: "Uğurlu",
                        description: "Qiymət planları yeniləndi"
                      });
                    } catch (error) {
                      toast({
                        title: "Xəta",
                        description: "Yeniləmə zamanı xəta baş verdi",
                        variant: "destructive"
                      });
                    }
                    setSaving(false);
                  }}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Saxlanılır...' : 'Qiymət Planlarını Yenilə'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Page Management */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Haqqında Səhifə Məzmunu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {aboutContent.map((content) => (
                  <Card key={content.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{content.section_type}</Badge>
                      </div>
                      
                      {content.section_type !== 'stats' && content.section_type !== 'features' && content.section_type !== 'contact' && (
                        <>
                          <div>
                            <Label>Başlıq</Label>
                            <Input 
                              value={content.title || ''} 
                              onChange={(e) => {
                                const updated = aboutContent.map(c => 
                                  c.id === content.id ? {...c, title: e.target.value} : c
                                );
                                setAboutContent(updated);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Təsvir</Label>
                            <Textarea 
                              value={content.description || ''} 
                              onChange={(e) => {
                                const updated = aboutContent.map(c => 
                                  c.id === content.id ? {...c, description: e.target.value} : c
                                );
                                setAboutContent(updated);
                              }}
                            />
                          </div>
                        </>
                      )}
                      
                      {(content.section_type === 'stats' || content.section_type === 'features' || content.section_type === 'contact') && (
                        <div>
                          <Label>JSON Məlumat</Label>
                          <Textarea 
                            value={JSON.stringify(content.content, null, 2)} 
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                const updated = aboutContent.map(c => 
                                  c.id === content.id ? {...c, content: parsed} : c
                                );
                                setAboutContent(updated);
                              } catch (error) {
                                // Invalid JSON, ignore
                              }
                            }}
                            className="font-mono text-sm"
                            rows={8}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                <Button 
                  onClick={async () => {
                    setSaving(true);
                    try {
                      for (const content of aboutContent) {
                        await supabase
                          .from('about_content')
                          .update({
                            title: content.title,
                            description: content.description,
                            content: content.content
                          })
                          .eq('id', content.id);
                      }
                      toast({
                        title: "Uğurlu",
                        description: "Haqqında səhifə məzmunu yeniləndi"
                      });
                    } catch (error) {
                      toast({
                        title: "Xəta",
                        description: "Yeniləmə zamanı xəta baş verdi",
                        variant: "destructive"
                      });
                    }
                    setSaving(false);
                  }}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Saxlanılır...' : 'Haqqında Məzmununu Yenilə'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}