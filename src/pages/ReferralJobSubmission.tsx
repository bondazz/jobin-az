import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import MobileHeader from '@/components/MobileHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { generatePageSEO, updatePageMeta } from '@/utils/seo';

const ReferralJobSubmission = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const refCode = searchParams.get('ref');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Applicant information
    applicant_name: '',
    applicant_surname: '',
    applicant_position: '',
    applicant_phone: '',
    // Job details
    company_name: '',
    voen: '',
    website: '',
    company_description: '',
    job_article: ''
  });

  // Setup SEO
  useEffect(() => {

    // Setup SEO for job submission page
    const setupSEO = async () => {
      const seoData = await generatePageSEO('job_submission');
      const jobSubmissionSEO = {
        ...seoData,
        title: 'İş Elanı Yerləşdir | Birləşik Elan | Jooble Azərbaycan',
        description: 'İş elanınızı pulsuz yerləşdirin. Referral sistemi ilə birləşik elan yerləşdirin və işəgötürənlərlə birbaşa əlaqə saxlayın. Azərbaycanda ən effektiv iş elanı platforması.',
        keywords: 'iş elanı yerləşdir, birləşik elan, referral sistem, iş elanı ver, vakansiya yerləşdir, işəgötürən, Azərbaycan iş elanları',
        url: '/add_job'
      };
      updatePageMeta(jobSubmissionSEO);

      // Add structured data for job posting
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "İş Elanı Yerləşdir",
        "description": "İş elanınızı referral sistemi ilə yerləşdirin",
        "url": window.location.href,
        "isPartOf": {
          "@type": "WebSite",
          "name": "Jooble Azərbaycan",
          "url": window.location.origin
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Ana Səhifə",
              "item": window.location.origin
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "İş Elanı Yerləşdir",
              "item": window.location.href
            }
          ]
        }
      };

      // Add structured data to head
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    };

    setupSEO();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      'applicant_name', 'applicant_surname', 'applicant_position', 
      'applicant_phone', 'company_name', 'job_article'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({ title: "Bütün məcburi sahələri doldurun", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let referralData = null;
      
      // Only check referral if code exists
      if (refCode) {
        const { data } = await supabase
          .from('referrals')
          .select('user_id')
          .eq('code', refCode)
          .eq('is_active', true)
          .maybeSingle();
        
        referralData = data;
      }

      // Submit the form data
      const submissionData = refCode && referralData ? {
        referral_code: refCode,
        referral_user_id: referralData.user_id,
        ...formData
      } : {
        referral_code: null,
        referral_user_id: null,
        ...formData
      };

      const { error } = await supabase
        .from('referral_job_submissions')
        .insert(submissionData);

      if (error) throw error;

      toast({ title: "Müraciətiniz uğurla göndərildi!" });
      
      // Reset form
      setFormData({
        applicant_name: '',
        applicant_surname: '',
        applicant_position: '',
        applicant_phone: '',
        company_name: '',
        voen: '',
        website: '',
        company_description: '',
        job_article: ''
      });

    } catch (error) {
      console.error('Submit error:', error);
      toast({ title: "Xəta baş verdi", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content with Scrolling */}
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Desktop Layout */}
        <div className="hidden xl:block h-screen overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
                  <CardTitle className="text-2xl font-bold text-center text-foreground">
                    Birləşik Elan Yerləşdir
                  </CardTitle>
                  <p className="text-muted-foreground text-center mt-2">
                    Aşağıdakı formu dolduraraq iş elanınızı yerləşdirə bilərsiniz
                  </p>
                </CardHeader>

                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Applicant Information */}
                    <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 text-center">
                       Müraciətçi məlumatları
                     </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="applicant_name">Ad *</Label>
                          <Input
                            id="applicant_name"
                            value={formData.applicant_name}
                            onChange={(e) => handleInputChange('applicant_name', e.target.value)}
                            required
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="applicant_surname">Soyad *</Label>
                          <Input
                            id="applicant_surname"
                            value={formData.applicant_surname}
                            onChange={(e) => handleInputChange('applicant_surname', e.target.value)}
                            required
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="applicant_position">Vəzifə *</Label>
                          <Input
                            id="applicant_position"
                            value={formData.applicant_position}
                            onChange={(e) => handleInputChange('applicant_position', e.target.value)}
                            required
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="applicant_phone">Telefon *</Label>
                          <Input
                            id="applicant_phone"
                            type="tel"
                            value={formData.applicant_phone}
                            onChange={(e) => handleInputChange('applicant_phone', e.target.value)}
                            placeholder="Sizinlə bu nömrə vasitəsilə əlaqə saxlanılacaq"
                            required
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 text-center">
                       Elan təfərrüatları
                     </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Şirkətin və ya fərdi sahibkarın adı *</Label>
                          <Input
                            id="company_name"
                            value={formData.company_name}
                            onChange={(e) => handleInputChange('company_name', e.target.value)}
                            required
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="voen">VÖEN</Label>
                          <Input
                            id="voen"
                            value={formData.voen}
                            onChange={(e) => handleInputChange('voen', e.target.value)}
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website">Veb Sayt</Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="Əgər yoxdursa boş saxlayın"
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company_description">Şirkət və ya biznes haqqında qısa məlumat</Label>
                        <Textarea
                          id="company_description"
                          value={formData.company_description}
                          onChange={(e) => handleInputChange('company_description', e.target.value)}
                          rows={3}
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="job_article">Elanda dərc olunacaq məqalə *</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Bu sahə iş elanının əsas məzmunudur. Bold yazılar və digər formatlaşdırma seçimlərini istifadə edə bilərsiniz.
                        </p>
                        <RichTextEditor
                          value={formData.job_article}
                          onChange={(value) => handleInputChange('job_article', value)}
                          placeholder="İş elanının təfərrüatlı təsvirini daxil edin..."
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 font-semibold py-3 text-lg"
                      >
                        {isSubmitting ? 'Göndərilir...' : 'Göndər'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="xl:hidden pt-16 pb-20 px-4 h-screen overflow-auto">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-4">
                <CardTitle className="text-xl font-bold text-center text-foreground">
                  Birləşik Elan Yerləşdir
                </CardTitle>
                <p className="text-muted-foreground text-center mt-2 text-sm">
                  Aşağıdakı formu dolduraraq iş elanınızı yerləşdirə bilərsiniz
                </p>
              </CardHeader>

              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Applicant Information */}
                  <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 text-center">
                     Müraciətçi məlumatları
                   </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobile_applicant_name">Ad *</Label>
                        <Input
                          id="mobile_applicant_name"
                          value={formData.applicant_name}
                          onChange={(e) => handleInputChange('applicant_name', e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobile_applicant_surname">Soyad *</Label>
                        <Input
                          id="mobile_applicant_surname"
                          value={formData.applicant_surname}
                          onChange={(e) => handleInputChange('applicant_surname', e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobile_applicant_position">Vəzifə *</Label>
                        <Input
                          id="mobile_applicant_position"
                          value={formData.applicant_position}
                          onChange={(e) => handleInputChange('applicant_position', e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobile_applicant_phone">Telefon *</Label>
                        <Input
                          id="mobile_applicant_phone"
                          type="tel"
                          value={formData.applicant_phone}
                          onChange={(e) => handleInputChange('applicant_phone', e.target.value)}
                          placeholder="Sizinlə bu nömrə vasitəsilə əlaqə saxlanılacaq"
                          required
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 text-center">
                     Elan təfərrüatları
                   </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobile_company_name">Şirkətin və ya fərdi sahibkarın adı *</Label>
                        <Input
                          id="mobile_company_name"
                          value={formData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobile_voen">VÖEN</Label>
                        <Input
                          id="mobile_voen"
                          value={formData.voen}
                          onChange={(e) => handleInputChange('voen', e.target.value)}
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobile_website">Veb Sayt</Label>
                        <Input
                          id="mobile_website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="Əgər yoxdursa boş saxlayın"
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobile_company_description">Şirkət və ya biznes haqqında qısa məlumat</Label>
                        <Textarea
                          id="mobile_company_description"
                          value={formData.company_description}
                          onChange={(e) => handleInputChange('company_description', e.target.value)}
                          rows={3}
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mobile_job_article">Elanda dərc olunacaq məqalə *</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Bu sahə iş elanının əsas məzmunudur. Bold yazılar və digər formatlaşdırma seçimlərini istifadə edə bilərsiniz.
                        </p>
                        <RichTextEditor
                          value={formData.job_article}
                          onChange={(value) => handleInputChange('job_article', value)}
                          placeholder="İş elanının təfərrüatlı təsvirini daxil edin..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 font-semibold py-3 text-lg"
                    >
                      {isSubmitting ? 'Göndərilir...' : 'Göndər'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile/Tablet */}
      <BottomNavigation 
        selectedCategory=""
        onCategorySelect={() => {}}
      />
    </>
  );
};

export default ReferralJobSubmission;