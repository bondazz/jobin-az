import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Send, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Check if user is admin
  useQuery({
    queryKey: ['admin-check'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        return null;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        navigate('/admin/login');
        return null;
      }

      return profile;
    }
  });

  // Get subscriber count
  const { data: subscriberCount } = useQuery({
    queryKey: ['push-subscribers-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Get recent notification logs
  const { data: notificationLogs } = useQuery({
    queryKey: ['notification-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      toast({
        title: "Xəta",
        description: "Başlıq və məzmun doldurulmalıdır",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call edge function to send push notifications
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: title.trim(),
          body: body.trim()
        }
      });

      if (error) throw error;

      toast({
        title: "Uğurlu!",
        description: `${data.sent} istifadəçiyə bildiriş göndərildi`,
      });

      // Clear form
      setTitle("");
      setBody("");
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: "Xəta",
        description: error.message || "Bildiriş göndərilə bilmədi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Push Bildirişlər</h1>
          <p className="text-muted-foreground mt-2">
            Bütün istifadəçilərə kampaniya bildirişləri göndərin
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Abunəçilər
              </CardTitle>
              <CardDescription>
                Bildirişlərə abunə olan istifadəçi sayı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{subscriberCount || 0}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Aktiv abunəçi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Yeni Bildiriş Göndər
              </CardTitle>
              <CardDescription>
                Bütün abunəçilərə bildiriş göndərin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlıq</Label>
                  <Input
                    id="title"
                    placeholder="Bildiriş başlığı..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Məzmun</Label>
                  <Textarea
                    id="body"
                    placeholder="Bildiriş məzmunu..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground">
                    {body.length}/300 simvol
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !title.trim() || !body.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Göndərilir...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Bildirişi Göndər
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Notification History */}
        <Card>
          <CardHeader>
            <CardTitle>Son Göndərilən Bildirişlər</CardTitle>
            <CardDescription>
              Göndərilmiş bildirişlərin tarixçəsi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationLogs && notificationLogs.length > 0 ? (
                notificationLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold">{log.title}</h4>
                      <p className="text-sm text-muted-foreground">{log.body}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('az-AZ')}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-green-600 font-semibold">
                        ✓ {log.sent_count}
                      </div>
                      {log.failed_count > 0 && (
                        <div className="text-red-600">
                          ✗ {log.failed_count}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Hələ bildiriş göndərilməyib
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Notifications;