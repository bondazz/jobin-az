"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin
} from 'lucide-react';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface Region {
  id: string;
  name: string;
  slug: string;
  description?: string;
  h1_title?: string | null;
  icon?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  is_active: boolean;
  created_at: string;
}

export default function AdminRegionsClient() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    h1_title: '',
    icon: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    is_active: true,
  });

  const router = useRouter();
  const { toast } = useToast();

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      router.push('/admin/login');
    }
  };

  const fetchRegions = async () => {
    try {
      const { data: regionsData, error } = await supabase
        .from('regions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedRegions = regionsData?.map(region => ({
        ...region,
        description: region.description || undefined,
        icon: region.icon || undefined,
        seo_title: region.seo_title || undefined,
        seo_description: region.seo_description || undefined,
        seo_keywords: region.seo_keywords || undefined,
      })) || [];

      setRegions(processedRegions);
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast({
        title: 'Xəta',
        description: 'Regionları yükləyərkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchRegions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const regionData = {
        ...formData,
        seo_keywords: formData.seo_keywords.split(',').map(k => k.trim()).filter(k => k),
      };

      if (editingRegion) {
        const { error } = await supabase
          .from('regions')
          .update(regionData)
          .eq('id', editingRegion.id);

        if (error) throw error;

        toast({
          title: 'Uğurlu',
          description: 'Region uğurla yeniləndi.',
        });
      } else {
        const { error } = await supabase
          .from('regions')
          .insert([regionData]);

        if (error) throw error;

        toast({
          title: 'Uğurlu',
          description: 'Region uğurla əlavə edildi.',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchRegions();
    } catch (error) {
      console.error('Error saving region:', error);
      toast({
        title: 'Xəta',
        description: 'Regionu saxlayarkən xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (region: Region) => {
    setEditingRegion(region);
    setFormData({
      name: region.name,
      slug: region.slug,
      description: region.description || '',
      h1_title: region.h1_title || '',
      icon: region.icon || '',
      seo_title: region.seo_title || '',
      seo_description: region.seo_description || '',
      seo_keywords: region.seo_keywords?.join(', ') || '',
      is_active: region.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu regionu silmək istədiyinizə əminsiniz?')) return;

    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Uğurlu',
        description: 'Region uğurla silindi.',
      });

      fetchRegions();
    } catch (error) {
      console.error('Error deleting region:', error);
      toast({
        title: 'Xəta',
        description: 'Regionu silərkən xəta baş verdi.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingRegion(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      h1_title: '',
      icon: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      is_active: true,
    });
  };

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && regions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Regionlar</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Region
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRegion ? 'Region Redaktə Et' : 'Yeni Region Əlavə Et'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Region Adı</Label>
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
                      placeholder="region-adi"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">İkon (Lucide İkon Adı)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="map-pin, building, city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="h1_title">Region Başlığı (H1)</Label>
                  <Input
                    id="h1_title"
                    value={formData.h1_title}
                    onChange={(e) => setFormData({ ...formData, h1_title: e.target.value })}
                    placeholder="Səhifədə göstəriləcək H1 başlıq"
                  />
                  <p className="text-xs text-muted-foreground">Bu başlıq region səhifəsində təsvirin üstündə H1 olaraq görünəcək</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Təsvir</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Region təsviri (link, bold, list əlavə edə bilərsiniz)"
                  />
                  <p className="text-xs text-muted-foreground">Link əlavə edərkən: mətni seçin → link düyməsinə basın → URL yazın</p>
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
                    {loading ? 'Saxlanılır...' : editingRegion ? 'Yenilə' : 'Əlavə et'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Region adı və ya təsvir üzrə axtarın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Regions List */}
        <div className="space-y-4">
          {filteredRegions.map((region) => (
            <div key={region.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {region.icon ? (
                      <DynamicIcon name={region.icon} className="h-6 w-6 text-primary" />
                    ) : (
                      <MapPin className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{region.name}</h3>
                      <Badge variant={region.is_active ? "default" : "secondary"}>
                        {region.is_active ? 'Aktiv' : 'Deaktiv'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Slug: {region.slug}</span>
                      {region.icon && <span>İkon: {region.icon}</span>}
                      <span>Yaradılıb: {new Date(region.created_at).toLocaleDateString('az-AZ')}</span>
                    </div>
                    {region.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {region.description.replace(/<[^>]*>/g, '').substring(0, 100)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(region)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(region.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRegions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Heç bir region tapılmadı.</p>
          </div>
        )}
      </div>
    </>
  );
}
