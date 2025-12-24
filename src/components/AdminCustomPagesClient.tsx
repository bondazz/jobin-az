"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, Search, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface CustomPage {
  id: string;
  slug: string;
  seo_title: string;
  seo_description: string | null;
  seo_keywords: string[] | null;
  canonical_url: string | null;
  content: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  schema_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const defaultPage: Partial<CustomPage> = {
  slug: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: [],
  canonical_url: '',
  content: '',
  og_title: '',
  og_description: '',
  og_image: 'https://jooble.az/icons/icon-512x512.jpg',
  twitter_title: '',
  twitter_description: '',
  schema_type: 'WebPage',
  is_active: true,
};

export default function AdminCustomPagesClient() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<CustomPage> | null>(null);
  const [pageToDelete, setPageToDelete] = useState<CustomPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast.error('Səhifələr yüklənmədi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPage({ ...defaultPage });
    setKeywordsInput('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (page: CustomPage) => {
    setEditingPage({ ...page });
    setKeywordsInput(page.seo_keywords?.join(', ') || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    
    if (!editingPage.slug || !editingPage.seo_title) {
      toast.error('URL slug və SEO başlığı məcburidir');
      return;
    }

    setSaving(true);
    try {
      const keywords = keywordsInput
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const pageData = {
        slug: editingPage.slug?.startsWith('/') ? editingPage.slug.slice(1) : editingPage.slug,
        seo_title: editingPage.seo_title,
        seo_description: editingPage.seo_description || null,
        seo_keywords: keywords,
        canonical_url: editingPage.canonical_url || `https://jooble.az/${editingPage.slug?.startsWith('/') ? editingPage.slug.slice(1) : editingPage.slug}`,
        content: editingPage.content || null,
        og_title: editingPage.og_title || editingPage.seo_title,
        og_description: editingPage.og_description || editingPage.seo_description,
        og_image: editingPage.og_image || 'https://jooble.az/icons/icon-512x512.jpg',
        twitter_title: editingPage.twitter_title || editingPage.og_title || editingPage.seo_title,
        twitter_description: editingPage.twitter_description || editingPage.og_description || editingPage.seo_description,
        schema_type: editingPage.schema_type || 'WebPage',
        is_active: editingPage.is_active ?? true,
      };

      if (editingPage.id) {
        const { error } = await supabase
          .from('custom_pages')
          .update(pageData)
          .eq('id', editingPage.id);
        
        if (error) throw error;
        toast.success('Səhifə yeniləndi');
      } else {
        const { error } = await supabase
          .from('custom_pages')
          .insert(pageData);
        
        if (error) throw error;
        toast.success('Səhifə yaradıldı');
      }

      setDialogOpen(false);
      setEditingPage(null);
      fetchPages();
    } catch (error: any) {
      toast.error('Xəta: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;

    try {
      const { error } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', pageToDelete.id);

      if (error) throw error;
      toast.success('Səhifə silindi');
      setDeleteDialogOpen(false);
      setPageToDelete(null);
      fetchPages();
    } catch (error: any) {
      toast.error('Xəta: ' + error.message);
    }
  };

  const filteredPages = pages.filter(page =>
    page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.seo_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">SEO Səhifələr</h1>
          <p className="text-muted-foreground">Custom SEO səhifələri yaradın və idarə edin</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Səhifə
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Axtar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="secondary">{pages.length} səhifə</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Heç bir səhifə tapılmadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>SEO Başlıq</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Yenilənmə</TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-mono text-sm">/{page.slug}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{page.seo_title}</TableCell>
                      <TableCell>
                        <Badge variant={page.is_active ? "default" : "secondary"}>
                          {page.is_active ? 'Aktiv' : 'Deaktiv'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(page.updated_at).toLocaleDateString('az-AZ')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://jooble.az/${page.slug}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(page)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setPageToDelete(page);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage?.id ? 'Səhifəni Redaktə Et' : 'Yeni SEO Səhifəsi'}
            </DialogTitle>
            <DialogDescription>
              SEO optimallaşdırılmış səhifə yaradın
            </DialogDescription>
          </DialogHeader>

          {editingPage && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">/</span>
                    <Input
                      id="slug"
                      value={editingPage.slug || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.replace(/^\//, '') })}
                      placeholder="vacancies"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={editingPage.canonical_url || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, canonical_url: e.target.value })}
                    placeholder="https://jooble.az/vacancies"
                  />
                </div>
              </div>

              {/* SEO Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">SEO Tənzimləmələri</h3>
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Başlıq * (max 60 simvol)</Label>
                  <Input
                    id="seo_title"
                    value={editingPage.seo_title || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, seo_title: e.target.value })}
                    placeholder="Vakansiyalar - Jooble Azerbaijan"
                    maxLength={70}
                  />
                  <p className="text-xs text-muted-foreground">{(editingPage.seo_title || '').length}/60</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Təsvir (max 160 simvol)</Label>
                  <Textarea
                    id="seo_description"
                    value={editingPage.seo_description || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, seo_description: e.target.value })}
                    placeholder="Azərbaycanda ən son vakansiyalar..."
                    maxLength={170}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">{(editingPage.seo_description || '').length}/160</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (vergüllə ayırın)</Label>
                  <Input
                    id="keywords"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    placeholder="vakansiya, iş, azerbaycan, jobs"
                  />
                </div>
              </div>

              {/* Open Graph Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Open Graph / Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="og_title">OG Başlıq</Label>
                    <Input
                      id="og_title"
                      value={editingPage.og_title || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, og_title: e.target.value })}
                      placeholder="SEO başlığından götürülür"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="og_image">OG Şəkil URL</Label>
                    <Input
                      id="og_image"
                      value={editingPage.og_image || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, og_image: e.target.value })}
                      placeholder="https://jooble.az/icons/icon-512x512.jpg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og_description">OG Təsvir</Label>
                  <Textarea
                    id="og_description"
                    value={editingPage.og_description || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, og_description: e.target.value })}
                    placeholder="SEO təsvirindən götürülür"
                    rows={2}
                  />
                </div>
              </div>

              {/* Twitter Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Twitter Card</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter_title">Twitter Başlıq</Label>
                    <Input
                      id="twitter_title"
                      value={editingPage.twitter_title || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, twitter_title: e.target.value })}
                      placeholder="OG başlığından götürülür"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_description">Twitter Təsvir</Label>
                    <Input
                      id="twitter_description"
                      value={editingPage.twitter_description || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, twitter_description: e.target.value })}
                      placeholder="OG təsvirindən götürülür"
                    />
                  </div>
                </div>
              </div>

              {/* Schema Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Schema.org</h3>
                <div className="space-y-2">
                  <Label htmlFor="schema_type">Schema Type</Label>
                  <Select
                    value={editingPage.schema_type || 'WebPage'}
                    onValueChange={(value) => setEditingPage({ ...editingPage, schema_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WebPage">WebPage</SelectItem>
                      <SelectItem value="AboutPage">AboutPage</SelectItem>
                      <SelectItem value="ContactPage">ContactPage</SelectItem>
                      <SelectItem value="FAQPage">FAQPage</SelectItem>
                      <SelectItem value="CollectionPage">CollectionPage</SelectItem>
                      <SelectItem value="ItemList">ItemList</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-4">
                <h3 className="font-semibold">Səhifə Kontenti</h3>
                <RichTextEditor
                  value={editingPage.content || ''}
                  onChange={(value) => setEditingPage({ ...editingPage, content: value })}
                  placeholder="Səhifə məzmununu bura yazın..."
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={editingPage.is_active ?? true}
                  onCheckedChange={(checked) => setEditingPage({ ...editingPage, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktiv</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Ləğv Et
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPage?.id ? 'Yenilə' : 'Yarat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Səhifəni Sil</DialogTitle>
            <DialogDescription>
              "{pageToDelete?.slug}" səhifəsini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Ləğv Et
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
