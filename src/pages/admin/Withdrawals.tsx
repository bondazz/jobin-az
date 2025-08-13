import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Search } from 'lucide-react';

interface Withdrawal {
  id: string;
  user_id: string;
  method: string; // 'card' | 'm10'
  destination: string;
  amount: number;
  status: string; // 'pending' | 'paid' | 'cancelled'
  admin_comment?: string | null;
  created_at: string;
}

export default function AdminWithdrawals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState<Withdrawal | null>(null);
  const [comment, setComment] = useState('');
  const [targetStatus, setTargetStatus] = useState<'paid' | 'cancelled' | null>(null);

  useEffect(() => {
    checkAuth();
    fetchRows();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return navigate('/admin/login');
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (profile?.role !== 'admin') navigate('/admin/login');
  };

  const fetchRows = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRows((data || []) as Withdrawal[]);
    } catch (e) {
      console.error(e);
      toast({ title: 'Xəta', description: 'Məlumatlar yüklənmədi', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = (row: Withdrawal, status: 'paid' | 'cancelled') => {
    setSelected(row);
    setTargetStatus(status);
    setComment(row.admin_comment || '');
  };

  const applyStatus = async () => {
    if (!selected || !targetStatus) return;
    if (targetStatus === 'cancelled' && !comment.trim()) {
      return toast({ title: 'Şərh tələb olunur', description: 'Ləğv səbəbini yazın' });
    }
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: targetStatus, admin_comment: comment || null })
      .eq('id', selected.id);

    if (error) return toast({ title: 'Xəta', description: 'Status yenilənmədi', variant: 'destructive' });
    toast({ title: 'Status yeniləndi' });
    setSelected(null);
    setTargetStatus(null);
    setComment('');
    fetchRows();
  };

  const filtered = rows.filter(r =>
    r.user_id.toLowerCase().includes(search.toLowerCase()) ||
    r.destination.toLowerCase().includes(search.toLowerCase())
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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Çıxarışlar</h1>
            <p className="text-muted-foreground">Referralların çıxarış müraciətlərini idarə edin</p>
          </div>
          <div className="relative w-80">
            <Input placeholder="User ID və ya təyinat axtar" value={search} onChange={(e)=>setSearch(e.target.value)} />
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gözləyən və tamamlanan çıxarışlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarix</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Metod</TableHead>
                    <TableHead>Təyinat</TableHead>
                    <TableHead>Məbləğ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Əməliyyat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{r.user_id}</TableCell>
                      <TableCell>{r.method === 'card' ? 'Kart' : 'M10'}</TableCell>
                      <TableCell className="max-w-[240px] truncate" title={r.destination}>{r.destination}</TableCell>
                      <TableCell className="font-semibold">{r.amount} AZN</TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'pending' ? 'secondary' : r.status === 'paid' ? 'default' : 'destructive'}>
                          {r.status === 'pending' ? 'Gözləyir' : r.status === 'paid' ? 'Ödənildi' : 'Ləğv edildi'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={selected?.id === r.id && targetStatus !== null} onOpenChange={(o)=>{ if(!o){ setSelected(null); setTargetStatus(null); setComment(''); }}}>
                            <DialogTrigger asChild>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={()=>openStatusDialog(r,'paid')}>
                                  <CheckCircle className="w-4 h-4 mr-1"/> Ödənildi
                                </Button>
                                <Button size="sm" variant="outline" onClick={()=>openStatusDialog(r,'cancelled')}>
                                  <XCircle className="w-4 h-4 mr-1"/> Ləğv et
                                </Button>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Statusu dəyiş: {targetStatus === 'paid' ? 'Ödənildi' : 'Ləğv edildi'}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3">
                                <Label>Admin şərhi {targetStatus==='cancelled' ? '(mütləq)' : '(opsional)'}</Label>
                                <Input value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Qısa səbəb" />
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={()=>{setSelected(null); setTargetStatus(null); setComment('');}}>Bağla</Button>
                                  <Button onClick={applyStatus}>Təsdiq et</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Nəticə tapılmadı</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
