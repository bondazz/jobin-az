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

  // Redirect if no referral code
  useEffect(() => {
    if (!refCode) {
      navigate('/');
    }
  }, [refCode, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!refCode) {
      toast({ title: "Referral kodu tapılmadı", variant: "destructive" });
      return;
    }

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
      // Get referral user ID from the referral code
      const { data: referralData } = await supabase
        .from('referrals')
        .select('user_id')
        .eq('code', refCode)
        .eq('is_active', true)
        .single();

      if (!referralData) {
        toast({ title: "Referral kodu keçərsizdir", variant: "destructive" });
        return;
      }

      // Submit the form data
      const { error } = await supabase
        .from('referral_job_submissions')
        .insert({
          referral_code: refCode,
          referral_user_id: referralData.user_id,
          ...formData
        });

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

  if (!refCode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">

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
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
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
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
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
  );
};

export default ReferralJobSubmission;