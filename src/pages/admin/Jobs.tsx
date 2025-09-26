import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  RefreshCw,
  Calendar
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company_id: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  tags: string[];
  views: number;
  category_id: string;
  application_url?: string;
  application_type: 'website' | 'email';
  application_email?: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  is_active: boolean;
  created_at: string;
  expiration_date?: string;
  companies: { name: string } | null;
  categories: { name: string } | null;
}

interface Company {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    location: '',
    type: 'full-time',
    salary: '',
    description: '',
    tags: '',
    category_id: '',
    application_url: '',
    application_type: 'website' as 'website' | 'email',
    application_email: '',
    slug: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    is_active: true,
    expiration_date: '',
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  // SEO auto-fill controls
  const [seoTitleEdited, setSeoTitleEdited] = useState(false);
  const [seoDescEdited, setSeoDescEdited] = useState(false);
  const [lastGeneratedSEO, setLastGeneratedSEO] = useState({ title: '', description: '' });

  const generateSeoFields = (title: string, companyName: string) => {
    const year = new Date().getFullYear();
    const seoTitle = `${title} vakansiyası – ${companyName}. ${year} iş elanları və vakansiyalar | Jooble.az`;
    const seoDescription = `${companyName} şirkəti ${title} vakansiyası üzrə işçi axtarır! Ən son iş elanı, vakansiyalar, yüksək maaşlı iş imkanları və karyera fürsətləri sizi gözləyir. İş elanına müraciət et!`;
    return { seoTitle, seoDescription };
  };

  useEffect(() => {
    checkAuth();
    fetchData();
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

  const fetchData = async () => {
    try {
      // İş elanlarını yüklə (bitmiş elanlar da daxil olmaqla)
      const jobsResponse = await supabase
        .from('jobs')
        .select(`
          *,
          companies (name),
          categories (name)
        `)
        .order('created_at', { ascending: false });

      // Şirkətləri optimizasiya ilə yüklə
      console.log('⚡ VAKANSIYA PANEL - İLK 15 ŞİRKƏTİ ANINDA YÜKLƏYİRİK');
      
      // İlk 15 şirkəti anında yüklə
      const { data: initialCompanies, error: initialError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
        .limit(15);
      
      if (initialError) throw initialError;
      
      console.log(`✅ Vakansiya ilk batch: ${initialCompanies?.length || 0} şirkət anında yükləndi`);
      
      // İlk şirkətləri göstər
      const formattedInitialCompanies = initialCompanies?.map(company => ({
        id: company.id,
        name: company.name
      })) || [];
      
      setCompanies(formattedInitialCompanies);
      setFilteredCompanies(formattedInitialCompanies);
      
      // Background-da qalan şirkətləri yüklə
      console.log('🔄 Vakansiya background-da qalan şirkətlər yüklənir...');
      loadRemainingCompaniesForJobsInBackground(formattedInitialCompanies);
      
      // Kateqoriyaları yüklə
      const categoriesResponse = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true);

      if (jobsResponse.data) setJobs(jobsResponse.data as Job[]);
      if (categoriesResponse.data) setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Xəta',
        description: 'Məlumatları yükləyərkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Background-da qalan şirkətləri yüklə (jobs üçün)
  const loadRemainingCompaniesForJobsInBackground = async (initialCompanies: Company[]) => {
    try {
      console.log('📊 Jobs background-da BÜTÜN ŞİRKƏTLƏRİ YÜKLƏYİRİK');
      
      let allCompaniesData: Company[] = [...initialCompanies];
      let pageSize = 1000;
      let currentPage = 0;
      let hasMoreData = true;
      let offset = 15; // İlk 15-i artıq yüklədik
      
      while (hasMoreData) {
        console.log(`📖 Jobs background səhifə ${currentPage + 1} yüklənir...`);
        
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .eq('is_active', true)
          .order('name')
          .range(offset + currentPage * pageSize, offset + (currentPage + 1) * pageSize - 1);
        
        if (error) throw error;
        
        console.log(`✅ Jobs background səhifə ${currentPage + 1}: ${data?.length || 0} şirkət`);
        
        if (data && data.length > 0) {
          const formattedCompanies = data.map(company => ({
            id: company.id,
            name: company.name
          }));
          
          allCompaniesData = [...allCompaniesData, ...formattedCompanies];
          console.log(`📈 Jobs background cəmi: ${allCompaniesData.length} şirkət`);
          
          if (data.length < pageSize) {
            hasMoreData = false;
          } else {
            currentPage++;
          }
        } else {
          hasMoreData = false;
        }
      }
      
      console.log(`🎉 JOBS BACKGROUND TAMAMLANDI! ${allCompaniesData.length} şirkət yükləndi`);
      
      // Background yükləmə tamamlandıqda state-i yenilə
      setCompanies(allCompaniesData);
      setFilteredCompanies(allCompaniesData);
      
    } catch (error) {
      console.error('❌ Jobs background yükləmə xətası:', error);
    }
  };

  // Filter companies based on search term
  useEffect(() => {
    if (companySearchTerm.trim()) {
      const filtered = companies.filter(company => 
        company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [companySearchTerm, companies]);

  // Auto-generate SEO fields and slug for new job based on title and company
  useEffect(() => {
    if (editingJob) return; // only for creating new vacancy

    const title = formData.title?.trim();
    const companyName = companies.find(c => c.id === formData.company_id)?.name?.trim();

    if (!title || !companyName) return;

    const { seoTitle, seoDescription } = generateSeoFields(title, companyName);
    
    // Auto-generate unique slug: company-name + job-title + 7-digit-number
    const processText = (text: string) => text
      .toLowerCase()
      .replace(/[ğüşöçıəĞÜŞÖÇIƏ]/g, match => {
        const map: Record<string, string> = {
          'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c', 'ı': 'i', 'ə': 'e',
          'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c', 'I': 'i', 'Ə': 'e'
        };
        return map[match] || match;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const companySlug = processText(companyName);
    const titleSlug = processText(title);
    
    // Generate unique 7-digit number
    const uniqueNumber = Math.floor(1000000 + Math.random() * 9000000);
    const uniqueSlug = `${companySlug}-${titleSlug}-${uniqueNumber}`;

    setFormData(prev => {
      const prevSeoTitle = prev.seo_title ?? '';
      const prevSeoDesc = prev.seo_description ?? '';
      const shouldUpdateTitle = !seoTitleEdited && (prevSeoTitle.trim() === '' || prevSeoTitle === lastGeneratedSEO.title);
      const shouldUpdateDesc = !seoDescEdited && (prevSeoDesc.trim() === '' || prevSeoDesc === lastGeneratedSEO.description);

      if (!shouldUpdateTitle && !shouldUpdateDesc && prev.slug) return prev;

      return {
        ...prev,
        seo_title: shouldUpdateTitle ? seoTitle : prev.seo_title,
        seo_description: shouldUpdateDesc ? seoDescription : prev.seo_description,
        slug: uniqueSlug, // Always generate unique slug for new jobs
      };
    });

    setLastGeneratedSEO({ title: seoTitle, description: seoDescription });
  }, [formData.title, formData.company_id, companies, editingJob, seoTitleEdited, seoDescEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        seo_keywords: formData.seo_keywords.split(',').map(k => k.trim()).filter(k => k),
        expiration_date: formData.expiration_date || null,
      };

      if (editingJob) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editingJob.id);

        if (error) throw error;
        
        toast({
          title: 'Uğurlu',
          description: 'Vakansiya uğurla yeniləndi.',
        });
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert([jobData]);

        if (error) throw error;
        
        toast({
          title: 'Uğurlu',
          description: 'Vakansiya uğurla əlavə edildi.',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: 'Xəta',
        description: 'Vakansiyani saxlayarkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if job is expired
  const isJobExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) <= new Date();
  };

  // Reactivate expired job with new expiration date
  const handleReactivate = async (job: Job) => {
    try {
      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 30);
      
      const { error } = await supabase
        .from('jobs')
        .update({
          is_active: true,
          expiration_date: newExpirationDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) throw error;
      
      toast({
        title: 'Uğurlu',
        description: `Vakansiya reaktivasiya edildi. Yeni bitmə tarixi: ${newExpirationDate.toLocaleDateString('az-AZ')}`,
      });
      
      fetchData();
    } catch (error) {
      console.error('Error reactivating job:', error);
      toast({
        title: 'Xəta',
        description: 'Vakansiyanı reaktivasiya edərkən xəta baş verdi.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    // Disable auto SEO updates when editing existing job
    setSeoTitleEdited(true);
    setSeoDescEdited(true);
    setFormData({
      title: job.title,
      company_id: job.company_id,
      location: job.location,
      type: job.type,
      salary: job.salary || '',
      description: job.description,
      tags: job.tags.join(', '),
      category_id: job.category_id,
      application_url: job.application_url || '',
      application_type: job.application_type || 'website',
      application_email: job.application_email || '',
      slug: job.slug,
      seo_title: job.seo_title || '',
      seo_description: job.seo_description || '',
      seo_keywords: job.seo_keywords?.join(', ') || '',
      is_active: job.is_active,
      expiration_date: job.expiration_date ? new Date(job.expiration_date).toISOString().split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu vakansiyanı silmək istədiyinizə əminsiniz?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Uğurlu',
        description: 'Vakansiya uğurla silindi.',
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Xəta',
        description: 'Vakansiyanı silərkən xəta baş verdi.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingJob(null);
    // Reset SEO auto-fill controls for new job
    setSeoTitleEdited(false);
    setSeoDescEdited(false);
    setLastGeneratedSEO({ title: '', description: '' });
    setFormData({
      title: '',
      company_id: '',
      location: '',
      type: 'full-time',
      salary: '',
      description: '',
      tags: '',
      category_id: '',
      application_url: '',
      application_type: 'website' as 'website' | 'email',
      application_email: '',
      slug: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      is_active: true,
      expiration_date: '',
    });
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vakansiyalar</h1>
            <p className="text-muted-foreground mt-2">Vakansiyaları idarə edin və yenilərini əlavə edin</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Vakansiya
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingJob ? 'Vakansiya Redaktə Et' : 'Yeni Vakansiya Əlavə Et'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Vakansiya Adı</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_id">Şirkət</Label>
                      <Select 
                        value={formData.company_id} 
                        onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Şirkət seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 sticky top-0 bg-background z-10">
                            <Input
                              placeholder="Şirkət axtarın..."
                              className="mb-2"
                              value={companySearchTerm}
                              onChange={(e) => setCompanySearchTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-60 overflow-auto">
                            {filteredCompanies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Yer</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Növ</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Tam zamanlı</SelectItem>
                          <SelectItem value="part-time">Yarı zamanlı</SelectItem>
                          <SelectItem value="contract">Müqavilə</SelectItem>
                          <SelectItem value="internship">Təcrübə</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Maaş</Label>
                      <Input
                        id="salary"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="Məs: 1000-2000 AZN"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Kateqoriya</Label>
                      <Select 
                        value={formData.category_id} 
                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kateqoriya seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiration_date">Bitmə Tarixi</Label>
                      <Input
                        id="expiration_date"
                        type="date"
                        value={formData.expiration_date}
                        onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-muted-foreground">
                        Boş buraxılırsa, yaradılma tarixindən 30 gün sonra avtomatik bitəcək
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Təsvir</Label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      placeholder="Vakansiya təsvirini yazın... (qalin hərf, başlıq, nöqtələr və s. əlavə edə bilərsiniz)"
                      className="min-h-[300px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="application_type">Müraciət Növü</Label>
                      <Select 
                        value={formData.application_type} 
                        onValueChange={(value: 'website' | 'email') => setFormData({ ...formData, application_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Veb Sayt</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.application_type === 'email' && (
                      <div className="space-y-2">
                        <Label htmlFor="application_email">Müraciət E-mail</Label>
                        <Input
                          id="application_email"
                          type="email"
                          value={formData.application_email}
                          onChange={(e) => setFormData({ ...formData, application_email: e.target.value })}
                          placeholder="jobs@company.com"
                        />
                      </div>
                    )}
                    {formData.application_type === 'website' && (
                      <div className="space-y-2">
                        <Label htmlFor="application_url_website">Müraciət Linki</Label>
                        <Input
                          id="application_url_website"
                          type="url"
                          value={formData.application_url}
                          onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                          placeholder="https://example.com/apply"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tags">Teqlər (vergüllə ayırın)</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="premium, new, urgent, remote"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="vakansiya-adi"
                        required
                      />
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">SEO Tənzimləmələri</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="seo_title">SEO Başlıq</Label>
                        <Input
                          id="seo_title"
                          value={formData.seo_title}
                          onChange={(e) => { setSeoTitleEdited(true); setFormData({ ...formData, seo_title: e.target.value }); }}
                          placeholder="Meta title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seo_description">SEO Təsvir</Label>
                        <Textarea
                          id="seo_description"
                          value={formData.seo_description}
                          onChange={(e) => { setSeoDescEdited(true); setFormData({ ...formData, seo_description: e.target.value }); }}
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
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Aktiv</Label>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Ləğv et
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saxlanılır...' : editingJob ? 'Yenilə' : 'Əlavə et'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Vakansiya, şirkət və ya yer üzrə axtarın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const expired = isJobExpired(job.expiration_date);
            
            return (
              <Card key={job.id} className={`hover:shadow-lg transition-shadow ${expired ? 'border-orange-200 bg-orange-50/50' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {job.companies?.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {expired && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleReactivate(job)}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          title="Reaktivasiya et"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleEdit(job)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(job.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type === 'full-time' ? 'Tam zamanlı' :
                         job.type === 'part-time' ? 'Yarı zamanlı' :
                         job.type === 'contract' ? 'Müqavilə' : 'Təcrübə'}
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {job.views} baxış
                    </div>

                    {job.expiration_date && (
                      <div className={`flex items-center gap-2 text-sm ${expired ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        <Calendar className="h-4 w-4" />
                        {expired ? 'Müddəti bitib' : 'Bitəcək'}: {new Date(job.expiration_date).toLocaleDateString('az-AZ')}
                      </div>
                    )}

                    {job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          job.is_active && !expired
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {job.is_active && !expired ? 'Aktiv' : expired ? 'Müddəti Bitib' : 'Deaktiv'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString('az-AZ')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Heç bir vakansiya tapılmadı.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}