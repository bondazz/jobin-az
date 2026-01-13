"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import MobileHeader from "@/components/MobileHeader";

import { useReferralCode } from "@/hooks/useReferralCode";

const ReferralJobSubmissionClient = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { referralCode } = useReferralCode();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [origin, setOrigin] = useState("");
  const [formData, setFormData] = useState({
    // Applicant information
    applicant_name: "",
    applicant_surname: "",
    applicant_position: "",
    applicant_phone: "",
    // Job details
    company_name: "",
    voen: "",
    website: "",
    company_description: "",
    job_article: "",
  });

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);

    // Format as (050) 993 77 66
    if (limitedDigits.length >= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6, 8)} ${limitedDigits.slice(8, 10)}`;
    } else if (limitedDigits.length >= 3) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else {
      return limitedDigits;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "applicant_phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [field]: formattedPhone,
      }));
    } else if (field === "voen") {
      // Only allow digits, max 10
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [field]: digits,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      "applicant_name",
      "applicant_surname",
      "applicant_position",
      "applicant_phone",
      "company_name",
      "job_article",
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Bütün məcburi sahələri doldurun",
          variant: "destructive",
        });
        return;
      }
    }
    setIsSubmitting(true);
    try {
      let referralData = null;

      // Debug logging
      console.log("Referral code from hook:", referralCode);

      // Only check referral if code exists
      if (referralCode) {
        const { data, error } = await supabase
          .from("referrals")
          .select("user_id")
          .eq("code", referralCode)
          .eq("is_active", true)
          .maybeSingle();
        console.log("Referral lookup result:", {
          data,
          error,
        });
        if (error) {
          console.error("Error looking up referral:", error);
        }
        referralData = data;
      }

      // Submit the form data - ensure referral_user_id is properly set
      const submissionData = {
        referral_code: referralCode || null,
        referral_user_id: referralData?.user_id || null,
        ...formData,
      };
      console.log("Submission data:", submissionData);
      const { error } = await supabase.from("referral_job_submissions").insert(submissionData);
      if (error) throw error;
      toast({
        title: "Müraciətiniz uğurla göndərildi!",
      });

      // Reset form
      setFormData({
        applicant_name: "",
        applicant_surname: "",
        applicant_position: "",
        applicant_phone: "",
        company_name: "",
        voen: "",
        website: "",
        company_description: "",
        job_article: "",
      });
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const structuredData = origin
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "İş Elanı Yerləşdir",
        description: "İş elanınızı referral sistemi ilə yerləşdirin",
        url: `${origin}/add_job`,
        isPartOf: {
          "@type": "WebSite",
          name: "Jobin Azərbaycan",
          url: origin,
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Ana Səhifə",
              item: origin,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "İş Elanı Yerləşdir",
              item: `${origin}/add_job`,
            },
          ],
        },
      }
    : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content with Scrolling */}
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Desktop Layout */}
        <div className="hidden xl:block h-screen overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 pb-6">
                  <CardTitle className="text-2xl font-bold text-center text-foreground">İş Elanı Yerləşdir</CardTitle>
                  <p className="text-muted-foreground text-center mt-2">
                    Şirkətiniz və ya şəxsi biznesiniz üçün vakansiya yerləşdirin və uyğun namizədləri tapın.
                  </p>
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm font-medium text-foreground text-center mb-2">
                      İlk vakansiyanız üçün endirimli qiymətlər:
                    </p>
                    <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                      <span>
                        • 1 elan – <span className="font-semibold text-primary">15 AZN</span>
                      </span>
                      <span>
                        • 5 və daha çox elan – <span className="font-semibold text-primary">10 AZN</span> / 1 elan
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">(Elanlar 1 ay aktiv qalır)</p>
                  </div>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      Elan yerləşdirməkdə çətinlik çəkirsinizsə, vakant vəzifə ilə bağlı məlumatları Word formatında{" "}
                      <span className="inline-flex items-center gap-1">
                        📧 <a href="mailto:info@Jobin.az" className="text-primary hover:underline font-medium">info@Jobin.az</a>
                      </span>{" "}
                      e-poçt ünvanına və ya{" "}
                      <span className="inline-flex items-center gap-1">
                        📱 <a href="https://wa.me/994553411011" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">055 341 10 11</a>
                      </span>{" "}
                      WhatsApp nömrəsinə göndərə bilərsiniz.
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Applicant Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 text-center">
                        Müraciətçi barədə məlumatlar
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="applicant_name">Ad *</Label>
                          <Input
                            id="applicant_name"
                            value={formData.applicant_name}
                            onChange={(e) => handleInputChange("applicant_name", e.target.value)}
                            placeholder="Adınızı daxil edin.."
                            required
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="applicant_surname">Soyad *</Label>
                          <Input
                            id="applicant_surname"
                            value={formData.applicant_surname}
                            onChange={(e) => handleInputChange("applicant_surname", e.target.value)}
                            placeholder="Soyadınızı daxil edin.."
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
                            onChange={(e) => handleInputChange("applicant_position", e.target.value)}
                            placeholder="Vəzifənizi daxil edin.."
                            required
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="applicant_phone">
                            Telefon * (Sizinlə bu nömrə vasitəsilə əlaqə saxlanılacaq)
                          </Label>
                          <Input
                            id="applicant_phone"
                            type="tel"
                            value={formData.applicant_phone}
                            onChange={(e) => handleInputChange("applicant_phone", e.target.value)}
                            placeholder="(XXX) XXX XX XX"
                            required
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 text-center">
                        İş elanı haqqında məlumat
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Şirkətin və ya fərdi sahibkarın adı *</Label>
                          <Input
                            id="company_name"
                            value={formData.company_name}
                            onChange={(e) => handleInputChange("company_name", e.target.value)}
                            required
                            className="focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="voen">VÖEN</Label>
                          <Input
                            id="voen"
                            value={formData.voen}
                            onChange={(e) => handleInputChange("voen", e.target.value)}
                            placeholder="Yoxdursa boş saxlayın.."
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
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          placeholder="Yoxdursa boş saxlayın.."
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company_description">Şirkət və ya biznes haqqında qısa məlumat</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Şirkətiniz haqqında məlumatı formatlaşdıra bilərsiniz.
                        </p>
                        <RichTextEditor
                          value={formData.company_description}
                          onChange={(value) => handleInputChange("company_description", value)}
                          placeholder="Şirkətiniz və ya biznesiniz haqqında məlumat yazın..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="job_article">Elanda dərc olunacaq məqalə *</Label>
                        <p className="text-sm text-muted-foreground mb-2">Bu sahə iş elanının əsas məzmunudur.</p>
                        <RichTextEditor
                          value={formData.job_article}
                          onChange={(value) => handleInputChange("job_article", value)}
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
                        {isSubmitting ? "Göndərilir..." : "Göndər"}
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
              <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-4 pb-5">
                <h1 className="font-bold text-center text-foreground text-xl">İş Elanı Yerləşdir</h1>
                <p className="text-muted-foreground text-center mt-2 text-sm">
                  Şirkətiniz və ya şəxsi biznesiniz üçün vakansiya yerləşdirin və uyğun namizədləri tapın.
                </p>
                <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium text-foreground text-center mb-2">
                    İlk vakansiyanız üçün endirimli qiymətlər:
                  </p>
                  <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                    <span>
                      • 1 elan – <span className="font-semibold text-primary">15 AZN</span>
                    </span>
                    <span>
                      • 5 və daha çox elan – <span className="font-semibold text-primary">10 AZN</span> / 1 elan
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">(Elanlar 1 ay aktiv qalır)</p>
                </div>
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    Elan yerləşdirməkdə çətinlik çəkirsinizsə, vakant vəzifə ilə bağlı məlumatları Word formatında{" "}
                    <span className="inline-flex items-center gap-1">
                      📧 <a href="mailto:info@Jobin.az" className="text-primary hover:underline font-medium">info@Jobin.az</a>
                    </span>{" "}
                    e-poçt ünvanına və ya{" "}
                    <span className="inline-flex items-center gap-1">
                      📱 <a href="https://wa.me/994553411011" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">055 341 10 11</a>
                    </span>{" "}
                    WhatsApp nömrəsinə göndərə bilərsiniz.
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Applicant Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 text-center">
                      Müraciətçi barədə məlumatlar
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobile_applicant_name">Ad *</Label>
                        <Input
                          id="mobile_applicant_name"
                          value={formData.applicant_name}
                          onChange={(e) => handleInputChange("applicant_name", e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile_applicant_surname">Soyad *</Label>
                        <Input
                          id="mobile_applicant_surname"
                          value={formData.applicant_surname}
                          onChange={(e) => handleInputChange("applicant_surname", e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile_applicant_position">Vəzifə *</Label>
                        <Input
                          id="mobile_applicant_position"
                          value={formData.applicant_position}
                          onChange={(e) => handleInputChange("applicant_position", e.target.value)}
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
                          onChange={(e) => handleInputChange("applicant_phone", e.target.value)}
                          placeholder="(050) 993 77 66"
                          required
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 text-center">
                      İş elanı haqqında məlumat
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobile_company_name">Şirkətin və ya fərdi sahibkarın adı *</Label>
                        <Input
                          id="mobile_company_name"
                          value={formData.company_name}
                          onChange={(e) => handleInputChange("company_name", e.target.value)}
                          required
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile_voen">VÖEN</Label>
                        <Input
                          id="mobile_voen"
                          value={formData.voen}
                          onChange={(e) => handleInputChange("voen", e.target.value)}
                          placeholder="Maksimum 10 rəqəm"
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile_website">Veb Sayt</Label>
                        <Input
                          id="mobile_website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          placeholder="Əgər yoxdursa boş saxlayın"
                          className="focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile_company_description">Şirkət və ya biznes haqqında qısa məlumat</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Şirkətiniz haqqında məlumatı formatlaşdıra bilərsiniz.
                        </p>
                        <RichTextEditor
                          value={formData.company_description}
                          onChange={(value) => handleInputChange("company_description", value)}
                          placeholder="Şirkətiniz və ya biznesiniz haqqında məlumat yazın..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile_job_article">Elanda dərc olunacaq məqalə *</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Bu sahə iş elanının əsas məzmunudur. Bold yazılar və digər formatlaşdırma seçimlərini istifadə
                          edə bilərsiniz.
                        </p>
                        <RichTextEditor
                          value={formData.job_article}
                          onChange={(value) => handleInputChange("job_article", value)}
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
                      {isSubmitting ? "Göndərilir..." : "Göndər"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferralJobSubmissionClient;
