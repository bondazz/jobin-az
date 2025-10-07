import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link, Loader2, RefreshCw, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GoogleIndexing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [indexingUrls, setIndexingUrls] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalCategories: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      navigate("/admin/login");
    }
  };

  const fetchStats = async () => {
    const [jobsResult, companiesResult, categoriesResult] = await Promise.all([
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("companies").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      totalJobs: jobsResult.count || 0,
      totalCompanies: companiesResult.count || 0,
      totalCategories: categoriesResult.count || 0,
    });
  };

  const handleBatchIndex = async () => {
    if (!indexingUrls.trim()) {
      toast.error("Zəhmət olmasa URL-lər daxil edin");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const urls = indexingUrls
        .split("\n")
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .map(url => ({
          url: url,
          type: 'URL_UPDATED' as const
        }));

      if (urls.length === 0) {
        toast.error("Heç bir keçərli URL tapılmadı");
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('google-indexing', {
        body: {
          action: 'batch',
          urls: urls
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        console.error("Response error:", response.error);
        throw response.error;
      }

      if (!response.data) {
        throw new Error("Cavab məlumatı tapılmadı");
      }

      setResults(response.data.results);
      
      const successCount = response.data.results.filter((r: any) => r.success).length;
      toast.success(`${successCount} / ${urls.length} URL uğurla indeksə göndərildi`);
    } catch (error: any) {
      console.error("Indexing error:", error);
      const errorMessage = error.message || "İndeksləmə zamanı xəta baş verdi";
      toast.error(errorMessage, {
        description: "Zəhmət olmasa konsol loglarını yoxlayın və ya Google məlumatlarınızı yenidən yoxlayın",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAllUrls = () => {
    const baseUrl = "https://jooble.az";
    const urls: string[] = [
      baseUrl,
      `${baseUrl}/vakansiyalar`,
      `${baseUrl}/companies`,
      `${baseUrl}/categories`,
      `${baseUrl}/about`,
      `${baseUrl}/services`,
    ];
    
    setIndexingUrls(urls.join("\n"));
    toast.success("Bütün URL-lər yaradıldı");
  };

  const generateJobUrls = async () => {
    setLoading(true);
    try {
      const { data: jobs } = await supabase
        .from("jobs")
        .select("slug")
        .eq("is_active", true)
        .limit(200);

      if (jobs) {
        const urls = jobs.map(job => `https://jooble.az/vakansiyalar/${job.slug}`);
        setIndexingUrls(urls.join("\n"));
        toast.success(`${jobs.length} vakansiya URL-i yaradıldı`);
      }
    } catch (error) {
      toast.error("URL-lərin yaradılması zamanı xəta");
    } finally {
      setLoading(false);
    }
  };

  const generateCompanyUrls = async () => {
    setLoading(true);
    try {
      const { data: companies } = await supabase
        .from("companies")
        .select("slug")
        .eq("is_active", true)
        .limit(200);

      if (companies) {
        const urls = companies.map(company => `https://jooble.az/companies/${company.slug}`);
        setIndexingUrls(urls.join("\n"));
        toast.success(`${companies.length} şirkət URL-i yaradıldı`);
      }
    } catch (error) {
      toast.error("URL-lərin yaradılması zamanı xəta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Google İndeksləmə
            </h1>
          </div>
          <p className="text-muted-foreground">
            Google axtarış sistemində səhifələrin indeksləşməsini idarə edin
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Cəmi Vakansiyalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalJobs}</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Cəmi Şirkətlər</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalCompanies}</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Cəmi Kateqoriyalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalCategories}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 shadow-card animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              URL İndeksləmə
            </CardTitle>
            <CardDescription>
              Google-a göndərmək istədiyiniz URL-ləri daxil edin (hər sətirdə bir URL)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="all">Hamısı</TabsTrigger>
                <TabsTrigger value="jobs">Vakansiyalar</TabsTrigger>
                <TabsTrigger value="companies">Şirkətlər</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
                <Textarea
                  placeholder="https://jooble.az/vakansiyalar/example-job&#10;https://jooble.az/companies/example-company"
                  value={indexingUrls}
                  onChange={(e) => setIndexingUrls(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </TabsContent>
              
              <TabsContent value="all" className="space-y-4">
                <div className="text-center py-8">
                  <Button 
                    onClick={generateAllUrls}
                    disabled={loading}
                    size="lg"
                    className="gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Bütün Əsas URL-ləri Yarat
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    Ana səhifə, vakansiyalar, şirkətlər və digər əsas səhifələr
                  </p>
                </div>
                {indexingUrls && (
                  <Textarea
                    value={indexingUrls}
                    onChange={(e) => setIndexingUrls(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                )}
              </TabsContent>
              
              <TabsContent value="jobs" className="space-y-4">
                <div className="text-center py-8">
                  <Button 
                    onClick={generateJobUrls}
                    disabled={loading}
                    size="lg"
                    className="gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Vakansiya URL-lərini Yarat
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    Aktiv vakansiyaların URL-lərini avtomatik yaradır (max 200)
                  </p>
                </div>
                {indexingUrls && (
                  <Textarea
                    value={indexingUrls}
                    onChange={(e) => setIndexingUrls(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                )}
              </TabsContent>
              
              <TabsContent value="companies" className="space-y-4">
                <div className="text-center py-8">
                  <Button 
                    onClick={generateCompanyUrls}
                    disabled={loading}
                    size="lg"
                    className="gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Şirkət URL-lərini Yarat
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    Aktiv şirkətlərin URL-lərini avtomatik yaradır (max 200)
                  </p>
                </div>
                {indexingUrls && (
                  <Textarea
                    value={indexingUrls}
                    onChange={(e) => setIndexingUrls(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                )}
              </TabsContent>
            </Tabs>

            <Button 
              onClick={handleBatchIndex} 
              disabled={loading || !indexingUrls.trim()}
              size="lg"
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  İndeksləşdirilir...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Google-a Göndər
                </>
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="font-semibold text-lg mb-4">Nəticələr</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 rounded-lg border border-border/50 bg-card/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono truncate text-muted-foreground">
                          {result.url}
                        </p>
                      </div>
                      <Badge variant={result.success ? "default" : "destructive"} className="ml-2">
                        {result.success ? "Uğurlu" : "Xəta"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoogleIndexing;
