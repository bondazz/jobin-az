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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Search, Plus, Minus } from 'lucide-react';

interface ReferralRow {
  id: string;
  user_id: string;
  code: string;
  clicks: number;
  earnings_azn: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminReferrals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [search, setSearch] = useState('');

  // balance edit dialog state
  const [editing, setEditing] = useState<ReferralRow | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [mode, setMode] = useState<'inc' | 'dec'>('inc');
  const [names, setNames] = useState<Record<string, string>>({});

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
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data || []) as ReferralRow[];
      setRows(rows);
      const userIds = Array.from(new Set(rows.map(r => r.user_id)));
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        const map: Record<string, string> = {};
        (profs || []).forEach(p => { map[(p as any).user_id] = (p as any).full_name || ''; });
        setNames(map);
      } else {
        setNames({});
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Xəta', description: 'Məlumatlar yüklənmədi', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (row: ReferralRow, value: boolean) => {
    const { error } = await supabase.from('referrals').update({ is_active: value }).eq('id', row.id);
    if (error) return toast({ title: 'Xəta', description: 'Status yenilənmədi', variant: 'destructive' });
    toast({ title: 'Yeniləndi' });
    fetchRows();
  };

  const applyBalanceChange = async () => {
    if (!editing) return;
    const delta = parseFloat(amount);
    if (isNaN(delta) || delta <= 0) return toast({ title: 'Məbləği düzgün daxil edin' });
    const newValue = mode === 'inc' ? editing.earnings_azn + delta : Math.max(0, editing.earnings_azn - delta);
    const { error } = await supabase.from('referrals').update({ earnings_azn: newValue }).eq('id', editing.id);
    if (error) return toast({ title: 'Xəta', description: 'Balans dəyişdirilmədi', variant: 'destructive' });
    toast({ title: 'Balans yeniləndi' });
    setEditing(null);
    setAmount('');
    fetchRows();
  };

  const filtered = rows.filter(r =>
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.user_id.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-3xl font-bold">Referrallar</h1>
            <p className="text-muted-foreground">Qeydiyyatdan keçmiş referralları idarə edin</p>
          </div>
          <div className="relative w-72">
            <Input placeholder="Kod və ya User ID axtar" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Referrallar siyahısı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kod</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Kliklər</TableHead>
                    <TableHead>Qazanc (AZN)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.code}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.user_id}</TableCell>
                      <TableCell className="text-sm">{names[r.user_id] || '-'}</TableCell>
                      <TableCell>{r.clicks}</TableCell>
                      <TableCell className="font-semibold">{r.earnings_azn ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={r.is_active} onCheckedChange={(v) => toggleActive(r, v)} />
                          <span className="text-sm">{r.is_active ? 'Aktiv' : 'Deaktiv'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog open={editing?.id === r.id} onOpenChange={(o) => { if (!o) { setEditing(null); setAmount(''); } }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => { setEditing(r); setMode('inc'); }}>
                              <Edit2 className="w-4 h-4 mr-2" /> Balans
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Balans dəyişdir</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="text-sm text-muted-foreground">Cari balans: <span className="font-medium">{editing?.earnings_azn ?? 0} AZN</span></div>
                              <div className="grid grid-cols-2 gap-2">
                                <Button variant={mode==='inc'?'default':'outline'} onClick={() => setMode('inc')}>
                                  <Plus className="w-4 h-4 mr-1"/> Artır
                                </Button>
                                <Button variant={mode==='dec'?'default':'outline'} onClick={() => setMode('dec')}>
                                  <Minus className="w-4 h-4 mr-1"/> Azalt
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <Label>Məbləğ (AZN)</Label>
                                <Input inputMode="decimal" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0" />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={()=>{setEditing(null); setAmount('');}}>Bağla</Button>
                                <Button onClick={applyBalanceChange}>Təsdiq et</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
