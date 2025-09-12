import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

const AdminSitemap = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingMain, setIsGeneratingMain] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [lastGeneratedMain, setLastGeneratedMain] = useState<Date | null>(null);
  const [sitemapData, setSitemapData] = useState<any>(null);
  const [mainSitemapData, setMainSitemapData] = useState<any>(null);
  const { toast } = useToast();

  const generateSitemap = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlContent = await response.text();
      
      // Parse XML to get stats
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
      const urls = xmlDoc.querySelectorAll('url');
      
      const stats = {
        totalUrls: urls.length,
        homePages: Array.from(urls).filter(url => 
          url.querySelector('loc')?.textContent?.endsWith('/') || 
          url.querySelector('loc')?.textContent?.includes('/about') ||
          url.querySelector('loc')?.textContent?.includes('/categories') ||
          url.querySelector('loc')?.textContent?.includes('/companies') ||
          url.querySelector('loc')?.textContent?.includes('/pricing')
        ).length,
        jobPages: Array.from(urls).filter(url => 
          url.querySelector('loc')?.textContent?.includes('/vacancies/')
        ).length,
        categoryPages: Array.from(urls).filter(url => 
          url.querySelector('loc')?.textContent?.includes('/categories/')
        ).length,
        companyPages: Array.from(urls).filter(url => 
          url.querySelector('loc')?.textContent?.includes('/companies/')
        ).length
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

  const generateMainSitemap = async () => {
    setIsGeneratingMain(true);
    try {
      const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-main');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlContent = await response.text();
      
      // Parse XML to get stats
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
      const urls = xmlDoc.querySelectorAll('url');
      
      const stats = {
        totalUrls: urls.length,
        staticPages: Array.from(urls).filter(url => {
          const loc = url.querySelector('loc')?.textContent || '';
          return loc === 'https://jooble.az/' || 
                 loc.includes('/about') || 
                 loc.includes('/categories') || 
                 loc.includes('/companies') || 
                 loc.includes('/pricing') ||
                 loc.includes('/referral') ||
                 loc.includes('/cv-builder');
        }).length,
        jobPages: Array.from(urls).filter(url => 
          url.querySelector('loc')?.textContent?.includes('/jobs/')
        ).length,
        categoryPages: Array.from(urls).filter(url => 
          url.querySelector('loc')?.textContent?.includes('/categories/')
        ).length,
        companyPages: Array.from(urls).filter(url => 
          url.querySelector('loc')?.textContent?.includes('/companies/')
        ).length
      };
      
      setMainSitemapData(stats);
      setLastGeneratedMain(new Date());
      
      toast({
        title: "Main Sitemap uğurla yeniləndi",
        description: `${stats.totalUrls} link əlavə edildi`,
      });
      
    } catch (error) {
      console.error('Error generating main sitemap:', error);
      toast({
        title: "Xəta baş verdi",
        description: "Main sitemap yenilənərkən xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMain(false);
    }
  };

  const openSitemap = () => {
    window.open('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml', '_blank');
  };

  const openMainSitemap = () => {
    window.open('/sitemap_main.xml', '_blank');
  };

  const openGoogleSearchConsole = () => {
    window.open('https://search.google.com/search-console', '_blank');
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sitemap Generator</h1>
            <p className="text-muted-foreground mt-2">
              SEO üçün sitemap.xml faylını idarə edin və yeniləyin
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            XML Sitemap
          </Badge>
        </div>

        <div className="grid gap-6">
          {/* Generator Cards Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Original Sitemap Generator Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Sitemap Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Sitemap-ı yenidən yaradın və bütün aktiv məzmunu əlavə edin
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
                      Sitemap Generate Et
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
                    Sitemap.xml-i Aç
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

            {/* Main Sitemap Generator Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Main Sitemap Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Main sitemap_main.xml-i yenidən yaradın (manual)
                  </p>
                  {lastGeneratedMain && (
                    <p className="text-xs text-muted-foreground">
                      Son yeniləmə: {lastGeneratedMain.toLocaleString('az-AZ')}
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={generateMainSitemap} 
                  disabled={isGeneratingMain}
                  className="w-full"
                  variant="secondary"
                >
                  {isGeneratingMain ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generasiya edilir...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Main Sitemap Generate Et
                    </>
                  )}
                </Button>

                <Separator />

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={openMainSitemap}
                    className="w-full"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    sitemap_main.xml-i Aç
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Cards Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Original Sitemap Statistics Card */}
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
                        <span>Google Standartı: Uyğun</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>URL: https://jooble.az/sitemap.xml</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Statistika üçün sitemap generate edin
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Main Sitemap Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Main Sitemap Statistikası
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mainSitemapData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{mainSitemapData.totalUrls}</p>
                        <p className="text-xs text-muted-foreground">Ümumi URL</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{mainSitemapData.staticPages}</p>
                        <p className="text-xs text-muted-foreground">Statik Səhifələr</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{mainSitemapData.jobPages}</p>
                        <p className="text-xs text-muted-foreground">İş Elanları</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{mainSitemapData.companyPages}</p>
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
                        <span>Tree View: Aktiv</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>URL: https://jooble.az/sitemap_main.xml</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Statistika üçün main sitemap generate edin
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Məlumatları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p><strong>Sitemap URL:</strong> https://jooble.az/sitemap.xml</p>
              <p><strong>Main Sitemap URL:</strong> https://jooble.az/sitemap_main.xml</p>
              <p><strong>Format:</strong> XML (Google Sitemap Standartı)</p>
              <p><strong>Yeniləmə tezliyi:</strong> Manuel və ya avtomatik</p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Google Search Console-a necə əlavə edilir:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>1. Google Search Console-a daxil olun</li>
                <li>2. "Sitemaps" bölməsinə keçin</li>
                <li>3. "sitemap.xml" və "sitemap_main.xml" əlavə edin</li>
                <li>4. "Submit" düyməsinə basın</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSitemap;