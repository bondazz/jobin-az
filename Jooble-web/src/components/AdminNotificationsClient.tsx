"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Send, Loader2, Users, Target, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Notifications = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const queryClient = useQueryClient();

  // Check if user is admin
  useQuery({
    queryKey: ['admin-check'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/admin/login');
        return null;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/admin/login');
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

  // Get categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Get category statistics
  const { data: categoryStats } = useQuery({
    queryKey: ['category-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('subscribed_categories');
      
      if (error) throw error;

      // Count subscribers per category
      const stats: Record<string, number> = {};
      data?.forEach((sub) => {
        sub.subscribed_categories?.forEach((catId: string) => {
          stats[catId] = (stats[catId] || 0) + 1;
        });
      });

      return stats;
    },
  });

  // Delete notification log mutation
  const deleteLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('notification_logs')
        .delete()
        .eq('id', logId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
      toast({
        title: "Uğurlu!",
        description: "Bildiriş silinidi",
      });
    },
    onError: () => {
      toast({
        title: "Xəta",
        description: "Bildiriş silinmədi",
        variant: "destructive",
      });
    },
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
          body: body.trim(),
          categoryId: selectedCategory !== "all" ? selectedCategory : undefined
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
      setSelectedCategory("all");
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
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Push Bildirişlər</h1>
          <p className="text-muted-foreground mt-2">
            Bütün istifadəçilərə kampaniya bildirişləri göndərin
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
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

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Kateqoriya Statistikası
              </CardTitle>
              <CardDescription>
                Kateqoriya üzrə abunəçi sayları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span>
                      {category.name}
                    </span>
                    <span className="font-semibold">
                      {categoryStats?.[category.id] || 0} abunəçi
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Yeni Bildiriş Göndər
              </CardTitle>
              <CardDescription>
                Seçilmiş kateqoriyaya və ya hamıya push bildirişi göndərin (emoji dəstəyi var 🎉)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kateqoriya</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Kateqoriya seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Hamıya göndər ({subscriberCount || 0})
                        </span>
                      </SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({categoryStats?.[category.id] || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Başlıq</Label>
                  <Input
                    id="title"
                    placeholder="Bildiriş başlığı (emoji istifadə edə bilərsiniz 😊)..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Məzmun</Label>
                  <Textarea
                    id="body"
                    placeholder="Bildiriş məzmunu (emoji dəstəyi var ✨)..."
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
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold">{log.title}</h4>
                      <p className="text-sm text-muted-foreground">{log.body}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('az-AZ')}
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteLogMutation.mutate(log.id)}
                        disabled={deleteLogMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
    </>

  );
};

export default Notifications;