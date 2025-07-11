import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface AdminSetup {
  hasAdmin: boolean;
  setupComplete: boolean;
}

export default function AdminSetupPage() {
  const [setupStatus, setSetupStatus] = useState<AdminSetup>({
    hasAdmin: false,
    setupComplete: false
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      // Check if there are any admin users
      const { data: admins, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (error) throw error;

      setSetupStatus({
        hasAdmin: (admins?.length || 0) > 0,
        setupComplete: (admins?.length || 0) > 0
      });
    } catch (error) {
      console.error('Error checking setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAdminAccount = async () => {
    setCreating(true);
    
    try {
      // Sign up admin user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@jobportal.az',
        password: 'admin123456',
        options: {
          data: {
            full_name: 'Admin User'
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Update user role to admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('user_id', data.user.id);

        if (updateError) throw updateError;

        setSetupStatus({
          hasAdmin: true,
          setupComplete: true
        });

        alert('Admin hesabı uğurla yaradıldı!\n\nEmail: admin@jobportal.az\nŞifrə: admin123456\n\n/admin/login səhifəsindən daxil ola bilərsiniz.');
      }
    } catch (error) {
      console.error('Error creating admin account:', error);
      alert('Admin hesabı yaradarkən xəta baş verdi: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Panel Quraşdırması</CardTitle>
          <p className="text-muted-foreground">Sistem quraşdırması və admin hesabı</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Database Strukturu</h3>
                <p className="text-sm text-muted-foreground">Tablalar və RLS policies</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ✓ Hazır
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Admin Hesabı</h3>
                <p className="text-sm text-muted-foreground">Administrator istifadəçisi</p>
              </div>
              <Badge variant={setupStatus.hasAdmin ? "secondary" : "outline"} 
                     className={setupStatus.hasAdmin ? "bg-green-100 text-green-800" : ""}>
                {setupStatus.hasAdmin ? "✓ Mövcud" : "Yoxdur"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Nümunə Məlumatlar</h3>
                <p className="text-sm text-muted-foreground">Kateqoriyalar, şirkətlər və vakansiyalar</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ✓ Əlavə edildi
              </Badge>
            </div>
          </div>

          {!setupStatus.hasAdmin && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900">Admin Hesabı Yaradılacaq:</h4>
                <div className="mt-2 text-sm text-blue-800">
                  <p><strong>Email:</strong> admin@jobportal.az</p>
                  <p><strong>Şifrə:</strong> admin123456</p>
                </div>
              </div>

              <Button 
                onClick={createAdminAccount} 
                disabled={creating}
                className="w-full"
                size="lg"
              >
                {creating ? 'Admin Hesabı Yaradılır...' : 'Admin Hesabı Yarat'}
              </Button>
            </div>
          )}

          {setupStatus.setupComplete && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900">✓ Quraşdırma Tamamlandı!</h4>
                <p className="text-sm text-green-800 mt-1">
                  Admin panel istifadəyə hazırdır.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => window.location.href = '/admin/login'}
                  className="w-full"
                  size="lg"
                >
                  Admin Panelinə Daxil Ol
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  Ana Səhifəyə Qayıt
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}