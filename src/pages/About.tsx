import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Award, Globe } from 'lucide-react';
import { generatePageSEO, updatePageMeta } from '@/utils/seo';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
const About = () => {
  const [aboutData, setAboutData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    const seoData = generatePageSEO('about');
    updatePageMeta(seoData);
    fetchAboutContent();
  }, []);
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
      <div className="p-8">
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
              <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                {missionData.description}
              </p>
            </CardContent>
          </Card>}

        {/* Features */}
        {featuresData.length > 0 && <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              {aboutData.features?.title || 'Nə Təklif Edirik'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuresData.map((feature: any, index: number) => <Card key={index} className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in" style={{
            animationDelay: `${index * 150}ms`
          }}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{feature.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
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