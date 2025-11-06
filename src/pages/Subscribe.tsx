import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Smartphone } from 'lucide-react';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PushNotificationSubscribe from '@/components/PushNotificationSubscribe';
import Layout from '@/components/Layout';

const Subscribe = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Abunə ol
          </h1>
          <p className="text-muted-foreground text-lg">
            Tətbiqi yükləyin və yeni vakansiyalardan xəbərdar olun
          </p>
        </div>

        <div className="space-y-6">
          {/* PWA Installation Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Tətbiqi Yüklə</CardTitle>
                  <CardDescription>
                    Mobil tətbiqi quraşdırın və istənilən vaxt vakansiyalara baxın
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PWAInstallPrompt />
            </CardContent>
          </Card>

          {/* Push Notifications Card */}
          <Card className="border-2 border-accent/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Push Bildirişlər</CardTitle>
                  <CardDescription>
                    Yeni vakansiyalardan dərhal xəbərdar olun
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PushNotificationSubscribe />
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
            <CardHeader>
              <CardTitle>Üstünlüklər</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sürətli giriş</p>
                    <p className="text-sm text-muted-foreground">
                      Tətbiqi yükləyərək vakansiyalara daha sürətli daxil olun
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Dərhal bildiriş</p>
                    <p className="text-sm text-muted-foreground">
                      Yeni vakansiyalar dərc olunduqda ilk siz xəbər tutun
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Offline işləmə</p>
                    <p className="text-sm text-muted-foreground">
                      İnternetə qoşulu olmasanız belə tətbiqdən istifadə edin
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-primary text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Qeydiyyat tələb olunmur</p>
                    <p className="text-sm text-muted-foreground">
                      Heç bir qeydiyyat olmadan dərhal istifadə edə bilərsiniz
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Subscribe;
