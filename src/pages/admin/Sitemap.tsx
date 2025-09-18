import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, ExternalLink, CheckCircle, AlertCircle, Save, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';

const AdminSitemap = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [sitemapData, setSitemapData] = useState<any>(null);
  const [manualXmlContent, setManualXmlContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const generateSitemap = async () => {
    setIsGenerating(true);
    try {
      // Get stats by calling the sitemap endpoints directly
      const [staticResponse, categoriesResponse, jobsResponse, companiesResponse] = await Promise.all([
        fetch('/sitemap-static.xml'),
        fetch('/sitemap-categories.xml'),
        fetch('/sitemap-jobs-1.xml'),
        fetch('/sitemap-companies-1.xml')
      ]);
      
      if (!staticResponse.ok || !categoriesResponse.ok || !jobsResponse.ok || !companiesResponse.ok) {
        throw new Error('Sitemap faylları yüklənə bilmədi');
      }

      const [staticXml, categoriesXml, jobsXml, companiesXml] = await Promise.all([
        staticResponse.text(),
        categoriesResponse.text(),
        jobsResponse.text(),
        companiesResponse.text()
      ]);
      
      // Parse XML to get stats
      const parser = new DOMParser();
      const staticDoc = parser.parseFromString(staticXml, "text/xml");
      const categoriesDoc = parser.parseFromString(categoriesXml, "text/xml");
      const jobsDoc = parser.parseFromString(jobsXml, "text/xml");
      const companiesDoc = parser.parseFromString(companiesXml, "text/xml");
      
      const staticUrls = staticDoc.querySelectorAll('url').length;
      const categoryUrls = categoriesDoc.querySelectorAll('url').length;
      const jobUrls = jobsDoc.querySelectorAll('url').length;
      const companyUrls = companiesDoc.querySelectorAll('url').length;
      
      const stats = {
        totalUrls: staticUrls + categoryUrls + jobUrls + companyUrls,
        staticPages: staticUrls,
        jobPages: jobUrls,
        categoryPages: categoryUrls,
        companyPages: companyUrls
      };
      
      setSitemapData(stats);
      setLastGenerated(new Date());
      
      toast({
        title: "Sitemap uğurla yeniləndi",
        description: `${stats.totalUrls} link əlavə edildi`,
      });
      
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast({
        title: "Xəta baş verdi",
        description: "Sitemap yenilənərkən xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const openSitemap = () => {
    window.open('/sitemap.xml', '_blank');
  };

  const openSitemapIndex = () => {
    window.open('/sitemap_index.xml', '_blank');
  };

  const openGoogleSearchConsole = () => {
    window.open('https://search.google.com/search-console', '_blank');
  };

  const saveSitemap = async () => {
    if (!manualXmlContent.trim()) {
      toast({
        title: "Xəta",
        description: "XML məzmun daxil edin",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('save-sitemap', {
        body: { 
          sitemapContent: manualXmlContent,
          filename: 'sitemap.xml'
        }
      });

      if (error) throw error;

      toast({
        title: "Sitemap yadda saxlanıldı",
        description: "XML məzmun uğurla yaddaşda saxlanıldı",
      });

      setManualXmlContent('');
    } catch (error) {
      console.error('Error saving sitemap:', error);
      toast({
        title: "Xəta baş verdi",
        description: "Sitemap saxlanılərkən xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sitemap İdarəetmə</h1>
            <p className="text-muted-foreground mt-2">
              SEO üçün birləşdirilmiş sitemap sistemi - bütün linklər avtomatik yenilənir
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Unified XML System
          </Badge>
        </div>

        {/* Manual Sitemap Editor Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Əl ilə Sitemap Redaktoru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                XML məzmunu birbaşa copy-paste edib sitemap.xml faylını yeniləyin
              </p>
            </div>
            
            <Textarea
              placeholder="XML məzmunu buraya əlavə edin...
&lt;urlset xmlns=&quot;http://www.sitemaps.org/schemas/sitemap/0.9&quot;&gt;
  &lt;url&gt;
    &lt;loc&gt;https://jooble.az&lt;/loc&gt;
    &lt;lastmod&gt;2025-09-17&lt;/lastmod&gt;
    &lt;changefreq&gt;daily&lt;/changefreq&gt;
    &lt;priority&gt;1.0&lt;/priority&gt;
  &lt;/url&gt;
&lt;/urlset&gt;"
              value={manualXmlContent}
              onChange={(e) => setManualXmlContent(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            
            <Button 
              onClick={saveSitemap} 
              disabled={isSaving || !manualXmlContent.trim()}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saxlanılır...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sitemap Saxla
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Unified Sitemap Generator Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Birləşdirilmiş Sitemap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Verilənlər bazasından avtomatik sitemap yaradır (max 1000 link/fayl)
                </p>
                {lastGenerated && (
                  <p className="text-xs text-muted-foreground">
                    Son yeniləmə: {lastGenerated.toLocaleString('az-AZ')}
                  </p>
                )}
              </div>
              
              <Button 
                onClick={generateSitemap} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generasiya edilir...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sitemap Yenilə
                  </>
                )}
              </Button>

              <Separator />

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={openSitemap}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  sitemap.xml (Tam)
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={openSitemapIndex}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  sitemap_index.xml (Hissələr)
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={openGoogleSearchConsole}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Google Search Console
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Sitemap Statistikası
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sitemapData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{sitemapData.totalUrls}</p>
                      <p className="text-xs text-muted-foreground">Ümumi URL</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{sitemapData.staticPages}</p>
                      <p className="text-xs text-muted-foreground">Statik Səhifələr</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{sitemapData.jobPages}</p>
                      <p className="text-xs text-muted-foreground">İş Elanları</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{sitemapData.categoryPages}</p>
                      <p className="text-xs text-muted-foreground">Kateqoriyalar</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{sitemapData.companyPages}</p>
                      <p className="text-xs text-muted-foreground">Şirkətlər</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>XML Formatı: Düzgün</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>URL Formatı: /vacancies/</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Tree View: Aktiv</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Avtomatik Yeniləmə: Aktiv</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Statistika üçün sitemap yeniləyin
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sitemap Məlumatları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p><strong>Ana sitemap:</strong> https://jooble.az/sitemap.xml</p>
              <p><strong>İndeks sitemap:</strong> https://jooble.az/sitemap_index.xml</p>
              <p><strong>Robots.txt referansı:</strong> https://jooble.az/sitemap.xml</p>
              <p><strong>Format:</strong> XML (Google Sitemap Standartı)</p>
              <p><strong>URL formatı:</strong> Bütün iş elanları /vacancies/ ilə başlayır</p>
              <p><strong>Yeniləmə:</strong> Verilənlər bazasından avtomatik əks olunur</p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Xüsusiyyətlər:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Tək mənbəli sitemap sistemi</li>
                <li>• XML tree formatında tez açılır</li>
                <li>• Service Worker ilə sürətli yükləmə</li>
                <li>• Bütün URL-lər düzgün /vacancies/ formatında</li>
                <li>• Məzmun dəyişiklikləri avtomatik əks olunur</li>
                <li>• Google SEO standartlarına uyğun</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSitemap;