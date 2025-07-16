import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import ImageUpload from '@/components/ImageUpload';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  background_image?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  about_seo_title?: string;
  about_seo_description?: string;
  jobs_seo_title?: string;
  jobs_seo_description?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  job_count?: number;
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    background_image: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    about_seo_title: '',
    about_seo_description: '',
    jobs_seo_title: '',
    jobs_seo_description: '',
    is_verified: false,
    is_active: true,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchCompanies();
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

  const fetchCompanies = async () => {
    try {
      // Fetch companies with job count
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select(`
          *,
          jobs!jobs_company_id_fkey(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to include job count
      const companiesWithJobCount = companiesData?.map(company => ({
        ...company,
        job_count: company.jobs?.length || 0,
        jobs: undefined // Remove the jobs array to clean up the object
      })) || [];

      setCompanies(companiesWithJobCount);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Xəta',
        description: 'Şirkətləri yükləyərkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const keywordsArray = formData.seo_keywords ? formData.seo_keywords.split(',').map(k => k.trim()).filter(k => k) : [];
      
      const companyData = {
        name: formData.name,
        slug: formData.slug,
        logo: formData.logo || null,
        background_image: formData.background_image || null,
        description: formData.description || null,
        website: formData.website || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        seo_keywords: keywordsArray.length > 0 ? keywordsArray : null,
        about_seo_title: formData.about_seo_title || null,
        about_seo_description: formData.about_seo_description || null,
        jobs_seo_title: formData.jobs_seo_title || null,
        jobs_seo_description: formData.jobs_seo_description || null,
        is_verified: formData.is_verified,
        is_active: formData.is_active
      };

      if (editingCompany) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', editingCompany.id);

        if (error) throw error;
        
        toast({
          title: 'Uğurlu',
          description: 'Şirkət uğurla yeniləndi.',
        });
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([companyData]);

        if (error) throw error;
        
        toast({
          title: 'Uğurlu',
          description: 'Şirkət uğurla əlavə edildi.',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: 'Xəta',
        description: 'Şirkəti saxlayarkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      slug: company.slug,
      logo: company.logo || '',
      background_image: company.background_image || '',
      description: company.description || '',
      website: company.website || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      seo_title: company.seo_title || '',
      seo_description: company.seo_description || '',
      seo_keywords: company.seo_keywords?.join(', ') || '',
      about_seo_title: company.about_seo_title || '',
      about_seo_description: company.about_seo_description || '',
      jobs_seo_title: company.jobs_seo_title || '',
      jobs_seo_description: company.jobs_seo_description || '',
      is_verified: company.is_verified,
      is_active: company.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu şirkəti silmək istədiyinizə əminsiniz?')) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Uğurlu',
        description: 'Şirkət uğurla silindi.',
      });
      
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Xəta',
        description: 'Şirkəti silərkən xəta baş verdi.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      slug: '',
      logo: '',
      background_image: '',
      description: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      about_seo_title: '',
      about_seo_description: '',
      jobs_seo_title: '',
      jobs_seo_description: '',
      is_verified: false,
      is_active: true,
    });
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Şirkətlər</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Şirkət
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? 'Şirkət Redaktə Et' : 'Yeni Şirkət Əlavə Et'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Şirkət Adı</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="sirket-adi"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUpload
                    value={formData.logo}
                    onChange={(url) => setFormData({ ...formData, logo: url })}
                    label="Logo"
                    placeholder="https://example.com/logo.png"
                  />
                  <ImageUpload
                    value={formData.background_image}
                    onChange={(url) => setFormData({ ...formData, background_image: url })}
                    label="Arxa Fon Şəkli"
                    placeholder="https://example.com/background.jpg"
                  />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Təsvir</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Veb Sayt</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="info@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+994 12 345 67 89"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Ünvan</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Bakı, Azərbaycan"
                      />
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">SEO Tənzimləmələri</h3>
                    
                    {/* General SEO */}
                    <div className="space-y-4 mb-6">
                      <h4 className="text-md font-medium text-muted-foreground">Ümumi SEO</h4>
                      <div className="space-y-2">
                        <Label htmlFor="seo_title">SEO Başlıq</Label>
                        <Input
                          id="seo_title"
                          value={formData.seo_title}
                          onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                          placeholder="Meta title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seo_description">SEO Təsvir</Label>
                        <Textarea
                          id="seo_description"
                          value={formData.seo_description}
                          onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                          rows={2}
                          placeholder="Meta description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seo_keywords">SEO Açar Sözlər (vergüllə ayırın)</Label>
                        <Input
                          id="seo_keywords"
                          value={formData.seo_keywords}
                          onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                          placeholder="açar söz 1, açar söz 2, açar söz 3"
                        />
                      </div>
                    </div>

                    {/* About Tab SEO */}
                    <div className="space-y-4 mb-6 border-t pt-4">
                      <h4 className="text-md font-medium text-muted-foreground">"Haqqında" Səhifəsi SEO</h4>
                      <div className="space-y-2">
                        <Label htmlFor="about_seo_title">Haqqında SEO Başlıq</Label>
                        <Input
                          id="about_seo_title"
                          value={formData.about_seo_title}
                          onChange={(e) => setFormData({ ...formData, about_seo_title: e.target.value })}
                          placeholder="Haqqında səhifəsi meta title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about_seo_description">Haqqında SEO Təsvir</Label>
                        <Textarea
                          id="about_seo_description"
                          value={formData.about_seo_description}
                          onChange={(e) => setFormData({ ...formData, about_seo_description: e.target.value })}
                          rows={2}
                          placeholder="Haqqında səhifəsi meta description"
                        />
                      </div>
                    </div>

                    {/* Jobs Tab SEO */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="text-md font-medium text-muted-foreground">"İş Elanları" Səhifəsi SEO</h4>
                      <div className="space-y-2">
                        <Label htmlFor="jobs_seo_title">İş Elanları SEO Başlıq</Label>
                        <Input
                          id="jobs_seo_title"
                          value={formData.jobs_seo_title}
                          onChange={(e) => setFormData({ ...formData, jobs_seo_title: e.target.value })}
                          placeholder="İş elanları səhifəsi meta title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobs_seo_description">İş Elanları SEO Təsvir</Label>
                        <Textarea
                          id="jobs_seo_description"
                          value={formData.jobs_seo_description}
                          onChange={(e) => setFormData({ ...formData, jobs_seo_description: e.target.value })}
                          rows={2}
                          placeholder="İş elanları səhifəsi meta description"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_verified"
                          checked={formData.is_verified}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                        />
                        <Label htmlFor="is_verified">Təsdiqlənmiş</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label htmlFor="is_active">Aktiv</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Ləğv et
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saxlanılır...' : editingCompany ? 'Yenilə' : 'Əlavə et'}
                    </Button>
                  </div>
                </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Şirkət adı, email və ya ünvan üzrə axtarın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Companies List */}
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{company.name}</h3>
                      <Badge variant={company.is_active ? "default" : "secondary"}>
                        {company.is_active ? 'Aktiv' : 'Deaktiv'}
                      </Badge>
                      {company.is_verified && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Təsdiqlənmiş
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {company.job_count} vakansiya
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <span>Slug: {company.slug}</span>
                      {company.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {company.email}
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {company.phone}
                        </div>
                      )}
                      <span>Yaradılıb: {new Date(company.created_at).toLocaleDateString('az-AZ')}</span>
                    </div>
                    {company.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {company.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(company)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(company.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Heç bir şirkət tapılmadı.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}