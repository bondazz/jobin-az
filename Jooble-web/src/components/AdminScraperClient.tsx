"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Bot, Play, Loader2, CheckCircle, XCircle, Clock, RefreshCw, Trash2, Calendar as CalendarIcon } from 'lucide-react';

interface ScrapeResult {
  title: string;
  company: string;
  category?: string;
  status: string;
  error?: string;
  jobId?: string;
}

interface ScrapeResponse {
  success: boolean;
  totalFound: number;
  alreadyScraped: number;
  newAvailable: number;
  processed: number;
  results: ScrapeResult[];
  error?: string;
}

interface ScrapedJob {
  id: string;
  source_url: string;
  job_id: string | null;
  source_site: string;
  scraped_at: string;
  status: string;
  error_message: string | null;
}

export default function AdminScraperClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [maxJobs, setMaxJobs] = useState(3);
  const [scrapeDate, setScrapeDate] = useState<Date>(new Date());
  const [botActive, setBotActive] = useState(false);
  const [lastResponse, setLastResponse] = useState<ScrapeResponse | null>(null);
  const [recentScrapes, setRecentScrapes] = useState<ScrapedJob[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/admin/login'); return; }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    if (profile?.role !== 'admin') { router.push('/admin/login'); return; }
    
    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'scraper_bot_active')
      .single();
    
    if (setting?.value !== undefined && setting?.value !== null) {
      setBotActive(setting.value === true || setting.value === 'true');
    }
    
    await fetchRecentScrapes();
    setLoading(false);
  }, [router]);

  const fetchRecentScrapes = async (filterDate?: string) => {
    let query = supabase
      .from('scraped_jobs' as any)
      .select('*')
      .order('scraped_at', { ascending: false });

    if (filterDate) {
      const startOfDay = `${filterDate}T00:00:00.000Z`;
      const endOfDay = `${filterDate}T23:59:59.999Z`;
      query = query.gte('scraped_at', startOfDay).lte('scraped_at', endOfDay);
    }

    query = query.limit(50);
    const { data } = await query;
    if (data) setRecentScrapes(data as any);
  };

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    if (!loading) {
      fetchRecentScrapes(dateFilter || undefined);
    }
  }, [dateFilter]);

  const toggleBot = async (active: boolean) => {
    setBotActive(active);
    
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'scraper_bot_active')
      .single();
    
    if (existing) {
      await supabase
        .from('site_settings')
        .update({ value: active as any, description: 'Scraper bot aktiv/deaktiv statusu' })
        .eq('key', 'scraper_bot_active');
    } else {
      await supabase
        .from('site_settings')
        .insert({ key: 'scraper_bot_active', value: active as any, description: 'Scraper bot aktiv/deaktiv statusu' });
    }
    
    toast({
      title: active ? 'Bot aktivləşdirildi' : 'Bot deaktiv edildi',
      description: active ? 'Skraper bot indi aktiv vəziyyətdədir' : 'Skraper bot dayandırıldı',
    });
  };

  const startScraping = async () => {
    setScraping(true);
    setLastResponse(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: 'Xəta', description: 'Sessiya tapılmadı', variant: 'destructive' }); return; }

      const targetDate = format(scrapeDate, 'yyyy-MM-dd');
      const response = await supabase.functions.invoke('scrape-jobs', {
        body: { maxJobs, targetDate },
      });

      if (response.error) {
        toast({ title: 'Xəta', description: response.error.message, variant: 'destructive' });
        return;
      }

      const data = response.data as ScrapeResponse;
      setLastResponse(data);
      
      if (data.success) {
        toast({
          title: 'Skraping tamamlandı!',
          description: `${data.processed} elan əlavə edildi (${data.totalFound} tapıldı, ${data.alreadyScraped} artıq mövcud)`,
        });
      }

      await fetchRecentScrapes(dateFilter || undefined);
    } catch (err: any) {
      toast({ title: 'Xəta', description: err.message, variant: 'destructive' });
    } finally {
      setScraping(false);
    }
  };

  const deleteScrapeRecord = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from('scraped_jobs' as any).delete().eq('id', id);
      if (error) {
        toast({ title: 'Xəta', description: error.message, variant: 'destructive' });
      } else {
        setRecentScrapes(prev => prev.filter(s => s.id !== id));
        toast({ title: 'Silindi', description: 'Skraping qeydi silindi' });
      }
    } catch (err: any) {
      toast({ title: 'Xəta', description: err.message, variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  const deleteAllVisible = async () => {
    if (!confirm('Göstərilən bütün qeydləri silmək istəyirsiniz?')) return;
    const ids = recentScrapes.map(s => s.id);
    if (ids.length === 0) return;

    try {
      const { error } = await supabase.from('scraped_jobs' as any).delete().in('id', ids);
      if (error) {
        toast({ title: 'Xəta', description: error.message, variant: 'destructive' });
      } else {
        setRecentScrapes([]);
        toast({ title: 'Silindi', description: `${ids.length} qeyd silindi` });
      }
    } catch (err: any) {
      toast({ title: 'Xəta', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Skraper Bot</h1>
          <p className="text-muted-foreground text-sm">jobsearch.az saytından elanları avtomatik götürün</p>
        </div>
      </div>

      {/* Bot Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bot Statusu</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-normal text-muted-foreground">
                {botActive ? 'Aktiv' : 'Deaktiv'}
              </span>
              <Switch checked={botActive} onCheckedChange={toggleBot} />
            </div>
          </CardTitle>
          <CardDescription>Botu aktiv/deaktiv edin. Aktiv olduqda cron ilə avtomatik işləyə bilər.</CardDescription>
        </CardHeader>
      </Card>

      {/* Manual Run Card */}
      <Card>
        <CardHeader>
          <CardTitle>Manual İşlətmə</CardTitle>
          <CardDescription>Tarix seçin, elan sayını təyin edin və skrapingi başladın.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Skrap tarixi</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !scrapeDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(scrapeDate, 'dd.MM.yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scrapeDate}
                    onSelect={(date) => date && setScrapeDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Maksimum elan sayı</label>
              <Input
                type="number"
                min={1}
                max={200}
                value={maxJobs}
                onChange={e => setMaxJobs(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                className="w-32"
              />
            </div>
            <Button
              onClick={startScraping}
              disabled={scraping}
              className="mt-5"
              size="lg"
            >
              {scraping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Skraping...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Başla
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {lastResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Son Nəticə
            </CardTitle>
            <CardDescription>
              Tapıldı: {lastResponse.totalFound} | Artıq mövcud: {lastResponse.alreadyScraped} | Yeni: {lastResponse.newAvailable} | Əlavə edildi: {lastResponse.processed}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastResponse.results.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    <p className="text-sm text-muted-foreground">{result.company}</p>
                    {result.category && (
                      <Badge variant="outline" className="mt-1 text-xs">{result.category}</Badge>
                    )}
                  </div>
                  <div>
                    {result.status === 'success' ? (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" /> Uğurlu
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" /> Xəta
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {lastResponse.results.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Yeni elan tapılmadı</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Scrapes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Son Skraping Tarixçəsi
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => fetchRecentScrapes(dateFilter || undefined)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {recentScrapes.length > 0 && (
                <Button variant="ghost" size="sm" onClick={deleteAllVisible} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hamısını sil
                </Button>
              )}
            </div>
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-40"
            />
            {dateFilter && (
              <Button variant="ghost" size="sm" onClick={() => setDateFilter('')}>
                Sıfırla
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentScrapes.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              {dateFilter ? 'Bu tarixdə skraping tapılmadı' : 'Hələ skraping edilməyib'}
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentScrapes.map((scrape) => (
                <div key={scrape.id} className="flex items-center justify-between p-2 rounded border text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs text-muted-foreground">{scrape.source_url}</p>
                    <p className="text-xs">
                      {new Date(scrape.scraped_at).toLocaleString('az-AZ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={scrape.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                      {scrape.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteScrapeRecord(scrape.id)}
                      disabled={deleting === scrape.id}
                    >
                      {deleting === scrape.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
