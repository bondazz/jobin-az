import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Smartphone } from 'lucide-react';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PushNotificationSubscribe from '@/components/PushNotificationSubscribe';
import MobileHeader from '@/components/MobileHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';
const Subscribe = () => {
  const isMobileOrTablet = useIsMobileOrTablet();
  return <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background overflow-y-auto">
      {isMobileOrTablet && <MobileHeader />}
      
      <div className={`container mx-auto px-4 max-w-4xl ${isMobileOrTablet ? 'pt-20 pb-24' : 'py-8'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Kateqoriyalara Abunə ol</h1>
          <p className="text-muted-foreground text-lg">Kateqoriyalara abunə olaraq yeni vakansiyalardan anında xəbərdar olun</p>
        </div>

        <div className="space-y-6">
          {/* Animated Phone Notification Demo */}
          <div className="w-full max-w-md mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" viewBox="0 0 360 160" role="img" aria-label="Phone top with 5 sequential push notifications">
              <defs>
                <filter id="softShadow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b" />
                  <feOffset in="b" dx="0" dy="8" result="o" />
                  <feComponentTransfer in="o" result="t">
                    <feFuncA type="table" tableValues="0 0.22" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode in="t" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <linearGradient id="bgGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#0f1724" />
                  <stop offset="1" stopColor="#07121a" />
                </linearGradient>

                <linearGradient id="glass" x1="0" x2="1">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.08" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.00" />
                </linearGradient>

                <radialGradient id="notifGlowOrange" cx="30%" cy="30%">
                  <stop offset="0" stopColor="#FF5C0A" stopOpacity="0.18" />
                  <stop offset="1" stopColor="#FF5C0A" stopOpacity="0" />
                </radialGradient>

                <clipPath id="phoneTopClip">
                  <rect x="0" y="0" width="360" height="160" rx="18" ry="18" />
                </clipPath>

                <style>
                  {`.title { font-family: Inter, Arial, sans-serif; fill:#F6FCFF; font-weight:700; }
                  .muted { font-family: Inter, Arial, sans-serif; fill:#DFF5FF; opacity:0.95; }
                  .jooble { font-family: Inter, Arial, sans-serif; font-weight:700; fill:#FFFFFF; }`}
                </style>
              </defs>

              <g clipPath="url(#phoneTopClip)">
                <rect x="0" y="0" width="360" height="160" fill="url(#bgGrad)" />
                <rect x="0" y="0" width="360" height="60" fill="url(#glass)" opacity="0.72" />
                <rect x="0" y="0" width="360" height="40" fill="#071022" />

                <text x="22" y="26" fontSize="14" className="title" opacity="0.96">13:41</text>

                <g transform="translate(82,9)" fill="#00AEEF" opacity="0.98">
                  <rect x="0" y="6" width="3" height="3" rx="0.9" />
                  <rect x="6" y="4" width="3" height="5" rx="0.9" />
                  <rect x="12" y="2" width="3" height="7" rx="0.9" />
                  <rect x="18" y="0" width="3" height="9" rx="0.9" />
                </g>

                <g transform="translate(268,8)" fill="#00AEEF" stroke="none">
                  <rect x="0" y="2" width="18" height="2.2" rx="1" />
                  <rect x="0" y="7" width="12" height="2.2" rx="1" />
                  <rect x="0" y="12" width="6" height="2.2" rx="1" />
                </g>

                <g transform="translate(316,10)">
                  <rect x="0" y="3" width="28" height="14" rx="3" ry="3" fill="none" stroke="#00AEEF" strokeWidth="1.8" />
                  <rect x="3" y="6" width="20" height="8" rx="2" fill="#00AEEF" />
                </g>

                <g transform="translate(160,6)"><rect x="0" y="0" width="40" height="6" rx="3" fill="#061421" /></g>
                <text x="22" y="72" fontSize="12" className="muted">Mesajlar</text>
                <g transform="translate(160,40)"><rect x="-18" y="0" width="36" height="4" rx="2" fill="#0f2a3a" opacity="0.6" /></g>

            <g id="n1" filter="url(#softShadow)" transform="translate(20,-120)" opacity="0">
              <animateTransform attributeName="transform" type="translate" begin="0s;21s" dur="0.6s" from="20,-120" to="20,48" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="0s;21s" dur="0.28s" from="0" to="1" fill="freeze" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" begin="4.1s;25.1s" dur="0.5s" from="20,48" to="20,-120" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="4.1s;25.1s" dur="0.3s" from="1" to="0" fill="freeze" repeatCount="indefinite" />

                  <ellipse cx="160" cy="86" rx="140" ry="34" fill="url(#notifGlowOrange)" opacity="0.55" />
                  <rect x="0" y="0" width="320" height="74" rx="14" ry="14" fill="#071a1c" stroke="#072f2a" strokeWidth="1.2" />
                  <rect x="0" y="0" width="320" height="26" rx="12" ry="12" fill="url(#glass)" opacity="0.18" />

                  <g transform="translate(16,13)">
                    <rect x="0" y="0" width="52" height="52" rx="12" ry="12" fill="#000" />
                    <text x="26" y="33" className="jooble" fontSize="12" textAnchor="middle">Jooble</text>
                  </g>

                  <text x="86" y="30" fontSize="15" className="title">Baş mühasib vakansiyası</text>
                  <text x="86" y="49" fontSize="12" className="muted">Jooble.az sənin üçün elan yerləşdirdi.</text>
                </g>

            <g id="n2" filter="url(#softShadow)" transform="translate(20,-120)" opacity="0">
              <animateTransform attributeName="transform" type="translate" begin="4.1s;25.1s" dur="0.6s" from="20,-120" to="20,48" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="4.1s;25.1s" dur="0.28s" from="0" to="1" fill="freeze" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" begin="8.2s;29.2s" dur="0.5s" from="20,48" to="20,-120" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="8.2s;29.2s" dur="0.3s" from="1" to="0" fill="freeze" repeatCount="indefinite" />

                  <ellipse cx="160" cy="86" rx="140" ry="34" fill="url(#notifGlowOrange)" opacity="0.5" />
                  <rect x="0" y="0" width="320" height="74" rx="14" ry="14" fill="#071a1c" stroke="#072f2a" strokeWidth="1.2" />
                  <rect x="0" y="0" width="320" height="26" rx="12" ry="12" fill="url(#glass)" opacity="0.18" />

                  <g transform="translate(16,13)">
                    <rect x="0" y="0" width="52" height="52" rx="12" ry="12" fill="#000" />
                    <text x="26" y="33" className="jooble" fontSize="12" textAnchor="middle">Jooble</text>
                  </g>

                  <text x="86" y="30" fontSize="15" className="title">Satış meneceri</text>
                  <text x="86" y="49" fontSize="12" className="muted">Yeni vakansiya: yüksək mükafatlı.</text>
                </g>

            <g id="n3" filter="url(#softShadow)" transform="translate(20,-120)" opacity="0">
              <animateTransform attributeName="transform" type="translate" begin="8.2s;29.2s" dur="0.6s" from="20,-120" to="20,48" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="8.2s;29.2s" dur="0.28s" from="0" to="1" fill="freeze" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" begin="12.3s;33.3s" dur="0.5s" from="20,48" to="20,-120" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="12.3s;33.3s" dur="0.3s" from="1" to="0" fill="freeze" repeatCount="indefinite" />

                  <ellipse cx="160" cy="86" rx="140" ry="34" fill="url(#notifGlowOrange)" opacity="0.5" />
                  <rect x="0" y="0" width="320" height="74" rx="14" ry="14" fill="#071a1c" stroke="#072f2a" strokeWidth="1.2" />
                  <rect x="0" y="0" width="320" height="26" rx="12" ry="12" fill="url(#glass)" opacity="0.18" />

                  <g transform="translate(16,13)">
                    <rect x="0" y="0" width="52" height="52" rx="12" ry="12" fill="#000" />
                    <text x="26" y="33" className="jooble" fontSize="12" textAnchor="middle">Jooble</text>
                  </g>

                  <text x="86" y="30" fontSize="15" className="title">Frontend developer</text>
                  <text x="86" y="49" fontSize="12" className="muted">React/TypeScript tələb olunur.</text>
                </g>

            <g id="n4" filter="url(#softShadow)" transform="translate(20,-120)" opacity="0">
              <animateTransform attributeName="transform" type="translate" begin="12.3s;33.3s" dur="0.6s" from="20,-120" to="20,48" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="12.3s;33.3s" dur="0.28s" from="0" to="1" fill="freeze" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" begin="16.4s;37.4s" dur="0.5s" from="20,48" to="20,-120" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="16.4s;37.4s" dur="0.3s" from="1" to="0" fill="freeze" repeatCount="indefinite" />

                  <ellipse cx="160" cy="86" rx="140" ry="34" fill="url(#notifGlowOrange)" opacity="0.5" />
                  <rect x="0" y="0" width="320" height="74" rx="14" ry="14" fill="#071a1c" stroke="#072f2a" strokeWidth="1.2" />
                  <rect x="0" y="0" width="320" height="26" rx="12" ry="12" fill="url(#glass)" opacity="0.18" />

                  <g transform="translate(16,13)">
                    <rect x="0" y="0" width="52" height="52" rx="12" ry="12" fill="#000" />
                    <text x="26" y="33" className="jooble" fontSize="12" textAnchor="middle">Jooble</text>
                  </g>

                  <text x="86" y="30" fontSize="15" className="title">Layiha rəhbəri</text>
                  <text x="86" y="49" fontSize="12" className="muted">Təcrübəli PM axtarılır - rəhbərlik.</text>
                </g>

            <g id="n5" filter="url(#softShadow)" transform="translate(20,-120)" opacity="0">
              <animateTransform attributeName="transform" type="translate" begin="16.4s;37.4s" dur="0.6s" from="20,-120" to="20,48" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="16.4s;37.4s" dur="0.28s" from="0" to="1" fill="freeze" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" begin="20.5s;41.5s" dur="0.5s" from="20,48" to="20,-120" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="20.5s;41.5s" dur="0.3s" from="1" to="0" fill="freeze" repeatCount="indefinite" />

                  <ellipse cx="160" cy="86" rx="140" ry="34" fill="url(#notifGlowOrange)" opacity="0.5" />
                  <rect x="0" y="0" width="320" height="74" rx="14" ry="14" fill="#071a1c" stroke="#072f2a" strokeWidth="1.2" />
                  <rect x="0" y="0" width="320" height="26" rx="12" ry="12" fill="url(#glass)" opacity="0.18" />

                  <g transform="translate(16,13)">
                    <rect x="0" y="0" width="52" height="52" rx="12" ry="12" fill="#000" />
                    <text x="26" y="33" className="jooble" fontSize="12" textAnchor="middle">Jooble</text>
                  </g>

                  <text x="86" y="30" fontSize="15" className="title">Marketinq mütəxəssisi</text>
                  <text x="86" y="49" fontSize="12" className="muted">Marketinq üzrə təcrübə üstünlükdür.</text>
                </g>

                <g transform="translate(330,6)" opacity="0.96">
                  <circle cx="0" cy="0" r="3.4" fill="#FF4D4F">
                    <animate attributeName="r" values="2.8;4;2.8" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.95;0.45;0.95" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </g>
              </g>
            </svg>
          </div>

          {/* PWA Installation Card */}
          

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
      
      {isMobileOrTablet && <BottomNavigation selectedCategory="" onCategorySelect={() => {}} />}
    </div>;
};
export default Subscribe;