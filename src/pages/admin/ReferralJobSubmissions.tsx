import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminLayout from '@/components/AdminLayout';
import { Eye, Edit, MessageSquare } from 'lucide-react';

interface ReferralJobSubmission {
  id: string;
  referral_code: string;
  referral_user_id: string;
  applicant_name: string;
  applicant_surname: string;
  applicant_position: string;
  applicant_phone: string;
  company_name: string;
  voen: string;
  website: string;
  company_description: string;
  job_article: string;
  status: string;
  admin_comment: string;
  created_at: string;
  updated_at: string;
}

const ReferralJobSubmissions = () => {
  const [submissions, setSubmissions] = useState<ReferralJobSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ReferralJobSubmission | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_job_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({ title: "Məlumatlar yüklənmədi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubmission || !statusUpdate) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('referral_job_submissions')
        .update({
          status: statusUpdate,
          admin_comment: adminComment,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast({ title: "Status uğurla yeniləndi" });
      await fetchSubmissions();
      setSelectedSubmission(null);
      setStatusUpdate('');
      setAdminComment('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: "Status yenilənmədi", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Gözləyir', variant: 'outline' as const },
      approved: { label: 'Təsdiqləndi', variant: 'default' as const },
      rejected: { label: 'Rədd edildi', variant: 'destructive' as const },
      published: { label: 'Paylaşıldı', variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Referral İş Elanları</h1>
          <Button onClick={fetchSubmissions} variant="outline">
            Yenilə
          </Button>
        </div>

        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {submission.company_name}
                  </CardTitle>
                  {getStatusBadge(submission.status)}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Müraciətçi: {submission.applicant_name} {submission.applicant_surname}</p>
                  <p>Vəzifə: {submission.applicant_position}</p>
                  <p>Referral: {submission.referral_code}</p>
                  <p>Tarix: {new Date(submission.created_at).toLocaleDateString('az-AZ')}</p>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Bax
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{submission.company_name} - Elan Detalları</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold">Müraciətçi Məlumatları</h4>
                            <p><strong>Ad Soyad:</strong> {submission.applicant_name} {submission.applicant_surname}</p>
                            <p><strong>Vəzifə:</strong> {submission.applicant_position}</p>
                            <p><strong>Telefon:</strong> {submission.applicant_phone}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Şirkət Məlumatları</h4>
                            <p><strong>VÖEN:</strong> {submission.voen || 'Təyin edilməyib'}</p>
                            <p><strong>Veb sayt:</strong> {submission.website || 'Yoxdur'}</p>
                            <p><strong>Referral:</strong> {submission.referral_code}</p>
                          </div>
                        </div>
                        
                        {submission.company_description && (
                          <div>
                            <h4 className="font-semibold">Şirkət Haqqında</h4>
                            <p className="text-sm">{submission.company_description}</p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-semibold">İş Elanı Məzmunu</h4>
                          <div 
                            className="prose prose-sm max-w-none border p-3 rounded-md bg-muted/30"
                            dangerouslySetInnerHTML={{ __html: submission.job_article }}
                          />
                        </div>
                        
                        {submission.admin_comment && (
                          <div>
                            <h4 className="font-semibold">Admin Qeyd</h4>
                            <p className="text-sm text-muted-foreground">{submission.admin_comment}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setStatusUpdate(submission.status);
                          setAdminComment(submission.admin_comment || '');
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Status Dəyiş
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Status Dəyişdir</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Status</Label>
                          <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Gözləyir</SelectItem>
                              <SelectItem value="approved">Təsdiqləndi</SelectItem>
                              <SelectItem value="rejected">Rədd edildi</SelectItem>
                              <SelectItem value="published">Paylaşıldı</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Admin Qeyd</Label>
                          <Textarea
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            placeholder="Qeyd əlavə edin..."
                            rows={3}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleStatusUpdate}
                          disabled={isUpdating}
                          className="w-full"
                        >
                          {isUpdating ? 'Yenilənir...' : 'Yadda Saxla'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {submissions.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Hələ referral elan müraciəti yoxdur</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReferralJobSubmissions;