"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Briefcase, TrendingUp } from 'lucide-react';
import { generatePageSEO, updatePageMeta } from '@/utils/seo';

import MobileHeader from '@/components/MobileHeader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ServicesClient = () => {
    const [plans, setPlans] = useState<any[]>([]);
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const updateSEO = async () => {
            const seoData = await generatePageSEO('services');
            updatePageMeta(seoData);
        };

        updateSEO();
        fetchPricingData();
    }, []);

    // Generate Service structured data
    const generateServiceSchema = () => {
        return {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Jooble İş Axtarış Xidməti",
            "description": "Azərbaycan'da iş elanları və vakansiya axtarış platforması. Müxtəlif sahələrdə iş imkanları və karyera məsləhətləri.",
            "provider": {
                "@type": "Organization",
                "name": "Jooble Azərbaycan",
                "url": typeof window !== 'undefined' ? window.location.origin : ''
            },
            "serviceType": "Job Search Platform",
            "areaServed": {
                "@type": "Country",
                "name": "Azerbaijan"
            },
            "offers": plans.map(plan => ({
                "@type": "Offer",
                "name": plan.name,
                "description": plan.description,
                "price": plan.price,
                "priceCurrency": "AZN",
                "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
            })),
            "url": typeof window !== 'undefined' ? window.location.href : ''
        };
    };

    const fetchPricingData = async () => {
        try {
            const [plansResponse, featuresResponse] = await Promise.all([
                supabase.from('pricing_plans').select('*').eq('is_active', true).order('display_order'),
                supabase.from('pricing_features').select('*').eq('is_active', true).order('category, display_order')
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

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-background to-primary/5">
            {/* Service Structured Data */}
            {plans.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateServiceSchema())
                    }}
                />
            )}

            <MobileHeader />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 xl:pt-8">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-primary rounded-xl shadow-elegant">
                            <Briefcase className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold" style={{ color: '#FF5C0A' }}>
                            Qiymət Planları və Xidmətlər
                        </h1>
                        <div className="p-3 bg-gradient-primary rounded-xl shadow-elegant">
                            <TrendingUp className="w-8 h-8 text-primary-foreground" />
                        </div>
                    </div>
                    <h2 className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-normal">
                        Azərbaycanda peşəkar işçi axtarışı üçün ideal platforma. <Link href="/vacancies" className="text-primary hover:underline font-semibold transition-colors">Vakansiyalar</Link> yerləşdirin, iş elanlarınızı yayımlayın və ən yaxşı namizədləri sürətlə tapın. Effektiv işəgötürmə həlli ilə vaxt və büdcəyə qənaət edin.
                    </h2>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-4xl mx-auto space-y-4 mb-20">
                    {plans.map((plan, index) => (
                        <Card key={plan.id} className={`border-2 hover:border-primary/50 transition-all duration-300 animate-fade-in ${plan.is_popular ? 'border-primary bg-gradient-to-r from-primary/5 to-primary/10' : 'border-border hover:bg-accent/30'}`} style={{
                            animationDelay: `${index * 150}ms`
                        }}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                                            {plan.is_popular && (
                                                <Badge variant="premium" className="px-3 py-1 text-xs font-semibold">
                                                    PREMIUM
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">{plan.description}</p>
                                    </div>
                                    <div className="text-right ml-6">
                                        <div className="text-3xl font-bold text-primary mb-1">
                                            {plan.price} AZN
                                        </div>
                                        {plan.price !== '0' && (
                                            <div className="text-sm text-muted-foreground">
                                                / {plan.period}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

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
                                        <Link href="/vacancies" className="text-foreground font-bold hover:text-primary transition-colors">
                                            Jooble.az
                                        </Link> rəsmi qeydiyyatdan keçmiş hüquqi şəxsdir və bütün ödənişlər
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


        </div>
    );
};

export default ServicesClient;
