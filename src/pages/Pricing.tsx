
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
import PremiumIcon from '@/components/ui/premium-icon';

const Pricing = () => {
  const plans = [
    {
      name: 'Əsas',
      price: '0',
      period: 'aylıq',
      description: 'İş axtaranlar üçün əsas funksiyalar',
      features: [
        'Limitsiz iş axtarışı',
        'Əsas süzgəclər',
        'Profil yaratma',
        'İş elanlarına müraciət',
        'E-poçt bildirişləri'
      ],
      icon: Star,
      color: 'border-border',
      buttonVariant: 'outline' as const,
      popular: false
    },
    {
      name: 'Premium',
      price: '29',
      period: 'aylıq',
      description: 'Daha çox imkan və üstünlük',
      features: [
        'Bütün əsas funksiyalar',
        'Premium iş elanları',
        'Prioritet dəstək',
        'Genişləndirilmiş süzgəclər',
        'CV analizi',
        'Şirkətlərlə birbaşa əlaqə',
        'Məxfi profil rejimi'
      ],
      icon: Zap,
      color: 'border-primary',
      buttonVariant: 'default' as const,
      popular: true
    },
    {
      name: 'Şirkət',
      price: '99',
      period: 'aylıq',
      description: 'İşəgötürənlər üçün tam həll',
      features: [
        'Bütün premium funksiyalar',
        'Limitsiz iş elanı',
        'Namizəd bazası',
        'Detallı analitika',
        'Şirkət səhifəsi',
        'Çoxlu istifadəçi',
        'API inteqrasiyası',
        'Xüsusi dəstək meneceri'
      ],
      icon: Crown,
      color: 'border-job-tag-premium',
      buttonVariant: 'default' as const,
      popular: false
    }
  ];

  const features = [
    {
      category: 'İş Axtarışı',
      items: [
        { name: 'Əsas axtarış', basic: true, premium: true, enterprise: true },
        { name: 'Genişləndirilmiş süzgəclər', basic: false, premium: true, enterprise: true },
        { name: 'Saxlanılan axtarışlar', basic: false, premium: true, enterprise: true },
        { name: 'AI tövsiyələri', basic: false, premium: true, enterprise: true },
      ]
    },
    {
      category: 'Profil və CV',
      items: [
        { name: 'Əsas profil', basic: true, premium: true, enterprise: true },
        { name: 'CV yükləmə', basic: true, premium: true, enterprise: true },
        { name: 'CV analizi', basic: false, premium: true, enterprise: true },
        { name: 'Məxfi profil', basic: false, premium: true, enterprise: true },
      ]
    },
    {
      category: 'Dəstək',
      items: [
        { name: 'E-poçt dəstəyi', basic: true, premium: true, enterprise: true },
        { name: 'Prioritet dəstək', basic: false, premium: true, enterprise: true },
        { name: 'Telefon dəstəyi', basic: false, premium: false, enterprise: true },
        { name: 'Xüsusi menecer', basic: false, premium: false, enterprise: true },
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background to-primary/5">
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <PremiumIcon size={32} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Qiymət Planları
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ehtiyaclarınıza uyğun planı seçin və karyeranızı yeni səviyyəyə çıxarın
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.color} shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in ${
                plan.popular ? 'scale-105 shadow-elegant' : ''
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="premium" className="px-4 py-1.5 shadow-premium">
                    <PremiumIcon size={14} className="mr-1" />
                    Ən Populyar
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.popular ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                  }`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1 mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-lg text-muted-foreground">AZN</span>
                  <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.buttonVariant}
                  className={`w-full py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                    plan.popular ? 'bg-gradient-primary hover:opacity-90 shadow-elegant hover:shadow-glow' : ''
                  }`}
                >
                  {plan.price === '0' ? 'Pulsuz Başla' : 'Seç və Başla'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <Card className="border-border/50 shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Funksiya Müqayisəsi</CardTitle>
          </CardHeader>
          <CardContent>
            {features.map((category) => (
              <div key={category.category} className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  {category.category}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Funksiya</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Əsas</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Premium</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Şirkət</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-border/20">
                          <td className="py-3 px-4 text-muted-foreground">{item.name}</td>
                          <td className="py-3 px-4 text-center">
                            {item.basic ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.premium ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.enterprise ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pricing;
