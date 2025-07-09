
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Award, Globe } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Users, label: 'Aktiv İstifadəçilər', value: '500K+', color: 'text-blue-500' },
    { icon: Target, label: 'İş Elanları', value: '50K+', color: 'text-green-500' },
    { icon: Award, label: 'Uğurlu Yerləşdirmələr', value: '25K+', color: 'text-purple-500' },
    { icon: Globe, label: 'Şəhərlər', value: '100+', color: 'text-orange-500' },
  ];

  const features = [
    {
      title: 'Asan Axtarış',
      description: 'Güclü axtarış mühərriki ilə arzuladığınız işi asanlıqla tapın.',
      icon: '🔍'
    },
    {
      title: 'Premium Elanlar',
      description: 'Yüksək keyfiyyətli və yoxlanılmış premium iş elanları.',
      icon: '⭐'
    },
    {
      title: 'Şirkət Profili',
      description: 'Şirkətlər haqqında ətraflı məlumat və reytinqlər.',
      icon: '🏢'
    },
    {
      title: '24/7 Dəstək',
      description: 'Hər zaman hazır olan peşəkar dəstək komandası.',
      icon: '💬'
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background to-primary/5">
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/e888818f-70b8-405b-a5e8-f62f8e842525.png" 
              alt="Jooble"
              className="w-12 h-12 object-contain dark:invert transition-all duration-300"
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Jooble Haqqında
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Azərbaycan'ın ən böyük iş axtarış platforması. Minlərlə iş elanı və yüzlərlə şirkət bir yerdə.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="text-center border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${stat.color} bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission */}
        <Card className="mb-12 border-border/50 shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bizim Missiyamız</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
              Jooble olaraq, Azərbaycan'da iş axtaranlar və işəgötürənlər arasında körpü qurmaq, 
              keyfiyyətli iş imkanları yaratmaq və karyera inkişafına dəstək olmaq məqsədindəyik. 
              Platformamız vasitəsilə minlərlə insanın arzuladığı işə qovuşmasına kömək edirəs.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Nə Təklif Edirik</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title} className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{feature.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent shadow-elegant animate-fade-in">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Bizimlə Əlaqə</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Suallarınızı, təkliflərinizi və ya iş təkliflərinizi bizə göndərin. 
              Komandamız sizinlə əlaqə saxlamaqdan məmnun olacaq.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                📧 info@jooble.az
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                📞 +994 12 345 67 89
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                📍 Bakı, Azərbaycan
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
