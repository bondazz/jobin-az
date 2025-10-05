import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Award, Globe } from 'lucide-react';
import { generatePageSEO, updatePageMeta } from '@/utils/seo';
import BottomNavigation from '@/components/BottomNavigation';
import MobileHeader from '@/components/MobileHeader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
const About = () => {
  const [aboutData, setAboutData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const updateSEO = async () => {
      const seoData = await generatePageSEO('about');
      updatePageMeta(seoData);
    };
    updateSEO();
    fetchAboutContent();
  }, []);

  // Generate AboutPage structured data
  const generateAboutPageSchema = () => {
    const headerData = aboutData.header;
    const contactData = aboutData.contact?.content || [];
    return {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": headerData?.title || "Jooble Haqqında",
      "description": headerData?.description || "Azərbaycan'ın ən böyük iş axtarış platforması. Minlərlə iş elanı və yüzlərlə şirkət bir yerdə.",
      "url": window.location.href,
      "mainEntity": {
        "@type": "Organization",
        "name": "Jooble Azərbaycan",
        "description": headerData?.description || "Azərbaycan'ın ən böyük iş axtarış platforması",
        "url": window.location.origin,
        "contactPoint": contactData.length > 0 ? contactData.map((contact: any) => ({
          "@type": "ContactPoint",
          "contactType": "customer service",
          "description": contact.value
        })) : undefined
      }
    };
  };
  const fetchAboutContent = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('about_content').select('*').eq('is_active', true).order('display_order');
      if (error) throw error;
      const contentMap = (data || []).reduce((acc: any, item: any) => {
        acc[item.section_type] = item;
        return acc;
      }, {});
      setAboutData(contentMap);
    } catch (error) {
      console.error('Error fetching about content:', error);
      toast({
        title: "Xəta",
        description: "Haqqında məlumatlarını yükləyərkən xəta baş verdi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return Users;
      case 'Target':
        return Target;
      case 'Award':
        return Award;
      case 'Globe':
        return Globe;
      default:
        return Users;
    }
  };
  if (loading) {
    return <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>;
  }
  const headerData = aboutData.header;
  const statsData = aboutData.stats?.content || [];
  const missionData = aboutData.mission;
  const featuresData = aboutData.features?.content || [];
  const contactData = aboutData.contact?.content || [];
  return <div className="h-full overflow-y-auto bg-gradient-to-br from-background to-primary/5">
      {/* AboutPage Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(generateAboutPageSchema())
    }} />
      
      {/* Mobile Header */}
      <MobileHeader />
      
      <div className="p-8 pt-20 xl:pt-8 pb-24 xl:pb-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {headerData?.title || 'Jooble Haqqında'}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {headerData?.description || "Azərbaycan'ın ən böyük iş axtarış platforması. Minlərlə iş elanı və yüzlərlə şirkət bir yerdə."}
          </p>
        </div>

        {/* Stats */}
        {statsData.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statsData.map((stat: any, index: number) => {
          const IconComponent = getIconComponent(stat.icon);
          return <Card key={index} className="text-center border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in" style={{
            animationDelay: `${index * 100}ms`
          }}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${stat.color} bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>;
        })}
          </div>}

        {/* Mission */}
        {missionData && <Card className="mb-12 border-border/50 shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl text-center">{missionData.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                  {missionData.description}
                </p>
                <div className="text-sm text-muted-foreground leading-relaxed max-w-4xl mx-auto space-y-3 pt-4 border-t border-border/30 mt-6">
                  <p>
                    Platformamız Azərbaycanda <strong>iş axtarışı</strong> prosesini sadələşdirmək və <strong>iş elanları</strong> ilə <strong>namizədlər</strong> arasında körpü yaratmaq məqsədi ilə fəaliyyət göstərir. Minlərlə <strong>vakansiya</strong>, yüzlərlə <strong>şirkət profili</strong> və müxtəlif sahələrdə <strong>iş imkanları</strong> təqdim edirik.
                  </p>
                  <p>
                    Platformamızda IT, maliyyə, satış, marketinq, mühəndislik və digər peşə sahələrində <strong>iş təklifləri</strong> tapa bilərsiniz. <Link to="/categories" className="text-primary hover:underline font-medium">Kateqoriyalar</Link> səhifəmizdə müxtəlif sahələr üzrə <strong>iş elanlarını</strong> nəzərdən keçirə, <Link to="/companies" className="text-primary hover:underline font-medium">şirkətlər</Link> bölməsində aparıcı işəgötürənlərlə tanış ola və <Link to="/pricing" className="text-primary hover:underline font-medium">qiymətləndirmə</Link> səhifəmizdə premium xüsusiyyətlərimiz haqqında məlumat əldə edə bilərsiniz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>}

        {/* Features */}
        {featuresData.length > 0 && <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              {aboutData.features?.title || 'Nə Təklif Edirik'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Job Listings */}
              <Link to="/" className="block group">
                <Card className="h-full border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in hover:scale-[1.02] cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          İş Elanları və Vakansiyalar
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Minlərlə aktiv <strong>iş elanı</strong> və <strong>vakansiya</strong> arasından sizə uyğun olanı tapın və müraciət edin.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Companies */}
              <Link to="/companies" className="block group">
                <Card className="h-full border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in hover:scale-[1.02] cursor-pointer" style={{
              animationDelay: '150ms'
            }}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          Şirkət Profilleri
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Yüzlərlə <strong>şirkət profili</strong> ilə tanış olun və işəgötürənlər haqqında ətraflı məlumat əldə edin.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Categories */}
              <Link to="/categories" className="block group">
                <Card className="h-full border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in hover:scale-[1.02] cursor-pointer" style={{
              animationDelay: '300ms'
            }}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          Kateqoriya üzrə Axtarış
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Müxtəlif <strong>iş sahələri</strong> və <strong>kateqoriyalar</strong> üzrə axtarış edin və uyğun vakansiyaları tapın.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Referral System */}
              <Link to="/referral" className="block group">
                <Card className="h-full border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in hover:scale-[1.02] cursor-pointer" style={{
              animationDelay: '450ms'
            }}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          Referal Sistemi
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Platformamızı paylaşın, <strong>referal linkləri</strong> ilə qazanc əldə edin və <strong>passiv gəlir</strong> əldə edin.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Direct Job Submission */}
              <Link to="/referral/submit" className="block group">
                <Card className="h-full border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in hover:scale-[1.02] cursor-pointer" style={{
              animationDelay: '600ms'
            }}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          Birbaşa Elan Müraciəti
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Sayt üzərindən birbaşa <strong>iş elanı göndərin</strong>, şirkətinizin vakansiyalarını dərc etdirin və namizədlər tapın.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Premium Features */}
              <Link to="/pricing" className="block group">
                <Card className="h-full border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in hover:scale-[1.02] cursor-pointer" style={{
              animationDelay: '750ms'
            }}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          Premium Xüsusiyyətlər
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          <strong>Premium üzvlük</strong> ilə əlavə imkanlardan yararlanın və iş axtarışınızı daha effektiv edin.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Database content features if available */}
              {featuresData.map((feature: any, index: number) => {})}
            </div>
          </div>}

        {/* Contact */}
        {contactData.length > 0 && <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent shadow-elegant animate-fade-in">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {aboutData.contact?.title || 'Bizimlə Əlaqə'}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                {aboutData.contact?.description || 'Suallarınızı, təkliflərinizi və ya iş təkliflərinizi bizə göndərin. Komandamız sizinlə əlaqə saxlamaqdan məmnun olacaq.'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {contactData.map((contact: any, index: number) => <Badge key={index} variant="outline" className="px-4 py-2 text-sm">
                    {contact.icon} {contact.value}
                  </Badge>)}
              </div>
            </CardContent>
          </Card>}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation selectedCategory="" onCategorySelect={() => {}} />
    </div>;
};
export default About;