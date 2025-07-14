import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
import PremiumIcon from '@/components/ui/premium-icon';
import { generatePageSEO, updatePageMeta } from '@/utils/seo';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Pricing = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const seoData = generatePageSEO('services');
    updatePageMeta(seoData);
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const [plansResponse, featuresResponse] = await Promise.all([
        supabase
          .from('pricing_plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        supabase
          .from('pricing_features')
          .select('*')
          .eq('is_active', true)
          .order('category, display_order')
      ]);

      if (plansResponse.error) throw plansResponse.error;
      if (featuresResponse.error) throw featuresResponse.error;

      setPlans(plansResponse.data || []);
      
      // Group features by category
      const groupedFeatures = (featuresResponse.data || []).reduce((acc: any, feature: any) => {
        if (!acc[feature.category]) {
          acc[feature.category] = [];
        }
        acc[feature.category].push({
          name: feature.feature_name,
          basic: feature.basic_plan,
          premium: feature.premium_plan,
          enterprise: feature.enterprise_plan
        });
        return acc;
      }, {});

      const featuresArray = Object.entries(groupedFeatures).map(([category, items]) => ({
        category,
        items
      }));

      setFeatures(featuresArray);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      toast({
        title: "Xəta",
        description: "Qiymət məlumatlarını yükləyərkən xəta baş verdi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return Zap;
      case 'Crown':
        return Crown;
      default:
        return Star;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-6">
            <PremiumIcon size={40} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Qiymət Planları
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Ehtiyaclarınıza uyğun planı seçin və karyeranızı yeni səviyyəyə çıxarın. 
            Ən müasir texnologiyalar və professional xidmətlər ilə.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => {
            const IconComponent = getIconComponent(plan.icon);
            return (
              <Card 
                key={plan.id} 
                className={`relative group border-2 hover:border-primary/50 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in ${
                  plan.is_popular 
                    ? 'lg:scale-110 border-primary shadow-2xl bg-gradient-to-br from-primary/5 to-primary/10' 
                    : 'border-border hover:bg-accent/30'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {plan.is_popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge variant="premium" className="px-6 py-2 text-sm font-semibold shadow-xl">
                      <PremiumIcon size={16} className="mr-2" />
                      Ən Populyar Seçim
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6 pt-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      plan.is_popular 
                        ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg' 
                        : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                    }`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                    <div className="text-left">
                      <span className="text-lg text-muted-foreground block">AZN</span>
                      <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  <ul className="space-y-4 mb-10">
                    {plan.features?.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-muted-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.is_popular ? "default" : "outline"}
                    size="lg"
                    className={`w-full py-4 text-lg font-semibold rounded-2xl transition-all duration-300 ${
                      plan.is_popular 
                        ? 'bg-gradient-primary hover:opacity-90 shadow-xl hover:shadow-2xl hover:scale-105' 
                        : 'hover:bg-primary hover:text-white hover:scale-105'
                    }`}
                  >
                    {plan.price === '0' ? 'Pulsuz Başla' : 'Planı Seç'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        {features.length > 0 && (
          <Card className="border-2 border-border/50 shadow-xl animate-fade-in mb-20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="text-3xl text-center font-bold">Xüsusiyyətlərin Müqayisəsi</CardTitle>
              <p className="text-center text-muted-foreground mt-2">Planların ətraflı müqayisəsi</p>
            </CardHeader>
            <CardContent className="p-8">
              {features.map((category: any) => (
                <div key={category.category} className="mb-10 last:mb-0">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    {category.category}
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-accent/30 border-b border-border">
                          <th className="text-left py-4 px-6 font-semibold text-foreground">Xüsusiyyət</th>
                          <th className="text-center py-4 px-6 font-semibold text-foreground">Əsas</th>
                          <th className="text-center py-4 px-6 font-semibold text-foreground">Premium</th>
                          <th className="text-center py-4 px-6 font-semibold text-foreground">Şirkət</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                            <td className="py-4 px-6 text-muted-foreground font-medium">{item.name}</td>
                            <td className="py-4 px-6 text-center">
                              {item.basic ? (
                                <Check className="w-6 h-6 text-primary mx-auto" />
                              ) : (
                                <span className="text-muted-foreground text-lg">—</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {item.premium ? (
                                <Check className="w-6 h-6 text-primary mx-auto" />
                              ) : (
                                <span className="text-muted-foreground text-lg">—</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {item.enterprise ? (
                                <Check className="w-6 h-6 text-primary mx-auto" />
                              ) : (
                                <span className="text-muted-foreground text-lg">—</span>
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
        )}

        {/* Service Information */}
        <div className="prose prose-lg max-w-none">
          <Card className="border-2 border-border shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <h2 className="text-3xl font-bold text-foreground mb-4">Xidmətlərimiz Haqqında</h2>
              <p className="text-muted-foreground">Peşəkar xidmətlərimiz və əməkdaşlıq qaydalarımız haqqında ətraflı məlumat</p>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <section>
                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  İş Elanı Yerləşdirilməsi Qaydaları
                </h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    İş elanı vermək istəyənlərdən xahiş olunur ki, vakant vəzifə barədə məlumatları Word formatında 
                    <strong className="text-foreground"> info@jooble.az</strong> elektron ünvanına göndərsinlər. 
                    Elan mətninin daha oxunaqlı və anlaşılan olması üçün komandamız tərəfindən bəzi qrammatik və üslubi düzəlişlər edilə bilər.
                  </p>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-3">Əsas Qaydalar:</h4>
                    <ul className="space-y-3 ml-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        Əgər işəgötürən əvvəlcədən müəyyən olunmuş beynəlxalq işədüzəltmə normalarına uyğun fəaliyyət göstərmirsə və ya dəfələrlə bu prinsipləri pozubsa, eləcə də qeyri-qanuni fəaliyyət göstərən şirkətlərin elanlarının yerləşdirilməsindən imtina oluna bilər.
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        İşəgötürən istəyə əsasən, şirkət adını elanda gizli saxlaya bilər, lakin bu halda məlumatlar administratora təqdim edilməlidir və məxfi saxlanılacaq.
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        Bitmə tarixi göstərilməyən elanlar sistemdə maksimum 1 ay müddətində aktiv qalacaq. Bu müddət əlavə ödənişlə uzadıla bilər.
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        Elan yerləşdirmək üçün istəyə görə Əlaqə bölməsinə də yazaraq müraciət edə bilərsiniz.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Reklam Bannerləri
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Saytımızda reklam yerləşdirmək istəyənlər üçün banner xidmət haqqı, bannerin ölçülərinə və sayt daxilində 
                  yerləşəcəyi bölməyə görə dəyişir. Bu barədə daha ətraflı məlumat almaq üçün Əlaqə səhifəsinə müraciət edə bilərsiniz.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Ödəniş və Sənədləşmə
                </h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">JobSearch.az</strong> rəsmi qeydiyyatdan keçmiş hüquqi şəxsdir və bütün ödənişlər 
                    bank köçürməsi ilə qəbul olunur. Xidmətlərimizə görə bütün vergi və rəsmi sənədlər qanunvericiliyə uyğun təqdim edilir.
                  </p>
                  <p>
                    Əməkdaşlıq rəsmi xidmət müqaviləsi imzalandıqdan sonra başlayır. Yeni müştərilərdən ilkin mərhələdə avans ödənişi 
                    tələb oluna bilər. Uzunmüddətli əməkdaşlıqdan sonra ödəniş, göstərilmiş xidmət əsasında həyata keçirilə bilər.
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        selectedCategory=""
        onCategorySelect={() => {}}
      />
    </div>
  );
};

export default Pricing;