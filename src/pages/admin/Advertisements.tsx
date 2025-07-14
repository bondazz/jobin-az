import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit2, Trash2, Eye, Calendar, MousePointer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';

interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  click_count: number;
  created_at: string;
  updated_at: string;
}

const AdminAdvertisements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    position: '',
    is_active: true,
    display_order: 0,
    start_date: '',
    end_date: ''
  });

  const positions = [
    { value: 'header', label: 'Header' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'footer', label: 'Footer' },
    { value: 'content', label: 'Content' },
    { value: 'job_listing', label: 'İş Elanları Arası' },
    { value: 'job_details', label: 'İş Təfərrüatları' }
  ];

  useEffect(() => {
    checkAuth();
    fetchAdvertisements();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      navigate('/admin/login');
    }
  };

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('position', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast({
        title: "Xəta",
        description: "Reklamlar yüklənərkən xəta baş verdi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingAd) {
        const { error } = await supabase
          .from('advertisements')
          .update({
            title: formData.title,
            description: formData.description || null,
            image_url: formData.image_url,
            link_url: formData.link_url || null,
            position: formData.position,
            is_active: formData.is_active,
            display_order: formData.display_order,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null
          })
          .eq('id', editingAd.id);

        if (error) throw error;
        
        toast({
          title: "Uğurlu",
          description: "Reklam yeniləndi"
        });
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert({
            title: formData.title,
            description: formData.description || null,
            image_url: formData.image_url,
            link_url: formData.link_url || null,
            position: formData.position,
            is_active: formData.is_active,
            display_order: formData.display_order,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null
          });

        if (error) throw error;
        
        toast({
          title: "Uğurlu",
          description: "Yeni reklam əlavə edildi"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAdvertisements();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: "Xəta",
        description: "Reklam saxlanılarkən xəta baş verdi",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu reklamı silmək istədiyinizdən əminsiniz?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Uğurlu",
        description: "Reklam silindi"
      });
      
      fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast({
        title: "Xəta",
        description: "Reklam silinərkən xəta baş verdi",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      position: '',
      is_active: true,
      display_order: 0,
      start_date: '',
      end_date: ''
    });
    setEditingAd(null);
  };

  const openEditDialog = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      position: ad.position,
      is_active: ad.is_active,
      display_order: ad.display_order,
      start_date: ad.start_date ? ad.start_date.split('T')[0] : '',
      end_date: ad.end_date ? ad.end_date.split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reklam İdarəsi</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Reklam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAd ? 'Reklamı Redaktə Et' : 'Yeni Reklam Əlavə Et'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Başlıq *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Açıqlama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <ImageUpload
                    label="Reklam Şəkli *"
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    placeholder="Reklam şəklinin URL-ni daxil edin"
                  />
                </div>

                <div>
                  <Label htmlFor="link_url">Link URL</Label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="position">Mövqe *</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mövqe seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="display_order">Göstərilmə Sırası</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Başlama Tarixi</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Bitmə Tarixi</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
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

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Ləğv et
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingAd ? 'Yenilə' : 'Əlavə Et'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reklamlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Şəkil</TableHead>
                    <TableHead>Başlıq</TableHead>
                    <TableHead>Mövqe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Kliklər</TableHead>
                    <TableHead>Tarixlər</TableHead>
                    <TableHead>Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advertisements.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <img 
                          src={ad.image_url} 
                          alt={ad.title}
                          className="w-16 h-10 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {positions.find(p => p.value === ad.position)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ad.is_active ? "default" : "secondary"}>
                          {ad.is_active ? 'Aktiv' : 'Deaktiv'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MousePointer className="w-4 h-4 text-muted-foreground" />
                          {ad.click_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {ad.start_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ad.start_date).toLocaleDateString()}
                            </div>
                          )}
                          {ad.end_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ad.end_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(ad)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(ad.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {advertisements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Hələ ki heç bir reklam yoxdur
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAdvertisements;