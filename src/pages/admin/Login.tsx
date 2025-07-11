import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail, Shield, UserPlus } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in and is admin
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile?.role === 'admin') {
          navigate('/admin/dashboard');
        }
      }
    };
    
    checkUser();
  }, [navigate]);

  const createAdminUser = async () => {
    setLoading(true);
    setError('');

    try {
      // First, sign up the admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'info@jooble.az',
        password: 'Samir_1155',
        options: {
          data: {
            full_name: 'Admin User'
          }
        }
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Update the user's role to admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('user_id', signUpData.user.id);

        if (updateError) throw updateError;

        // If user was created but needs email confirmation, we'll set confirmed
        if (!signUpData.session) {
          // Sign out and show success message
          await supabase.auth.signOut();
          setError('');
          alert('Admin hesabı yaradıldı! İndi giriş edə bilərsiniz.');
          setShowCreateAdmin(false);
        } else {
          // User is automatically logged in
          navigate('/admin/dashboard');
        }
      }
    } catch (err: any) {
      if (err.message.includes('already registered')) {
        setError('Bu email artıq qeydiyyatdan keçib. Giriş etməyi cəhd edin.');
        setShowCreateAdmin(false);
      } else {
        setError('Admin hesabı yaradarkən xəta: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email və ya şifrə yanlışdır. Admin hesabı yaratmaq lazımdırsa, aşağıdakı düyməni basın.');
          setShowCreateAdmin(true);
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          setError('Bu panel sadəcə admin istifadəçiləri üçündür.');
          await supabase.auth.signOut();
          return;
        }

        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError('Giriş zamanı xəta baş verdi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
          <p className="text-muted-foreground">İdarəetmə panelinə daxil olun</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="info@jooble.az"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Şifrə</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Giriş edilir...' : 'Daxil ol'}
            </Button>

            {showCreateAdmin && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-3">
                  Admin hesabı mövcud deyil. Yaratmaq istəyirsiniz?
                </p>
                <Button 
                  type="button"
                  onClick={createAdminUser}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? 'Admin hesabı yaradılır...' : 'Admin Hesabı Yarat'}
                </Button>
                <p className="text-xs text-blue-600 mt-2">
                  Email: info@jooble.az<br />
                  Şifrə: Samir_1155
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}