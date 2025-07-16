import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, RefreshCw, Plus, Trash2, Upload, User, Briefcase, GraduationCap, Award, Globe, Heart, Phone, Mail, MapPin, Camera } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import { useSEO } from '@/hooks/useSEO';

interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  summary: string;
  phone: string;
  email: string;
  location: string;
  profilePhoto: string;
}

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startYear: string;
  endYear: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
}

interface CVData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  languages: string[];
  socialLinks: { platform: string; url: string; id: string }[];
  hobbies: string[];
  selectedTemplate: number;
}

const CVBuilder = () => {
  useSEO({
    title: "CV Builder - Peşəkar CV Hazırlayın",
    description: "Pulsuz onlayn CV düzəldən vasitəsilə peşəkar CV/Resume hazırlayın. Qeydiyyat tələb olunmur.",
    keywords: "cv builder, resume builder, pulsuz cv, peşəkar resume"
  });

  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: '',
      jobTitle: '',
      summary: '',
      phone: '',
      email: '',
      location: '',
      profilePhoto: ''
    },
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    socialLinks: [],
    hobbies: [],
    selectedTemplate: 1
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '', id: '' });

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('cvBuilder');
    if (savedData) {
      setCvData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cvBuilder', JSON.stringify(cvData));
  }, [cvData]);

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      startYear: '',
      endYear: '',
      description: ''
    };
    setCvData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newExp]
    }));
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeWorkExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      startYear: '',
      endYear: ''
    };
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setCvData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setCvData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const addSocialLink = () => {
    if (newSocialLink.platform.trim() && newSocialLink.url.trim()) {
      setCvData(prev => ({
        ...prev,
        socialLinks: [...prev.socialLinks, { ...newSocialLink, id: Date.now().toString() }]
      }));
      setNewSocialLink({ platform: '', url: '', id: '' });
    }
  };

  const removeSocialLink = (index: number) => {
    setCvData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const addHobby = () => {
    if (newHobby.trim()) {
      setCvData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()]
      }));
      setNewHobby('');
    }
  };

  const removeHobby = (index: number) => {
    setCvData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index)
    }));
  };

  const resetAll = () => {
    setCvData({
      personalInfo: {
        fullName: '',
        jobTitle: '',
        summary: '',
        phone: '',
        email: '',
        location: '',
        profilePhoto: ''
      },
      workExperience: [],
      education: [],
      skills: [],
      certifications: [],
      languages: [],
      socialLinks: [],
      hobbies: [],
      selectedTemplate: 1
    });
    localStorage.removeItem('cvBuilder');
  };

  const downloadPDF = () => {
    // PDF download functionality would go here
    alert('PDF yükləmə funksiyası burada tətbiq olunacaq');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handlePersonalInfoChange('profilePhoto', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/3 to-background">
      <MobileHeader />
      
      <div className="pt-16 xl:pt-0 pb-20 xl:pb-0">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">CV Builder</h1>
            <p className="text-lg text-muted-foreground">Dəqiqələr ərzində peşəkar CV hazırlayın</p>
          </div>

          {/* Template Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">Şablon Seçin</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {[1, 2, 3, 4, 5].map((template) => (
                <div
                  key={template}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                    cvData.selectedTemplate === template
                      ? 'border-primary shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setCvData(prev => ({ ...prev, selectedTemplate: template }))}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded mb-2 flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {template === 1 ? '🎨' : template === 2 ? '💼' : template === 3 ? '✨' : template === 4 ? '🚀' : '🌟'}
                    </span>
                  </div>
                  <h3 className="font-medium text-center">
                    {template === 1 ? 'Modern Kreativ' : 
                     template === 2 ? 'Klassik Biznes' : 
                     template === 3 ? 'Minimal Elegant' : 
                     template === 4 ? 'Texnoloji' : 
                     'Premium Gold'}
                  </h3>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {template === 1 ? '2025 trend dizayn' : 
                     template === 2 ? 'Peşəkar görünüş' : 
                     template === 3 ? 'Sadə və şık' : 
                     template === 4 ? 'Müasir texno stil' : 
                     'Lüks premium görünüş'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Form Section - Scrollable */}
            <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
                  <TabsTrigger value="personal" className="text-xs">
                    <User className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Şəxsi</span>
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="text-xs">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Təcrübə</span>
                  </TabsTrigger>
                  <TabsTrigger value="education" className="text-xs">
                    <GraduationCap className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Təhsil</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="text-xs">
                    <Award className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Bacarıqlar</span>
                  </TabsTrigger>
                  <TabsTrigger value="social" className="text-xs">
                    <Globe className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Sosial</span>
                  </TabsTrigger>
                  <TabsTrigger value="hobbies" className="text-xs">
                    <Heart className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Hobbilər</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Şəxsi Məlumatlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Profile Photo Upload */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          {cvData.personalInfo.profilePhoto ? (
                            <img
                              src={cvData.personalInfo.profilePhoto}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover border-4 border-border"
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                              <Camera className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-sm text-muted-foreground">Tövsiyə olunan: 150x150px</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Tam Ad *</label>
                          <Input
                            value={cvData.personalInfo.fullName}
                            onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">İş Başlığı *</label>
                          <Input
                            value={cvData.personalInfo.jobTitle}
                            onChange={(e) => handlePersonalInfoChange('jobTitle', e.target.value)}
                            placeholder="Proqram Tərtibatçısı"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Xülasə/Haqqımda</label>
                        <Textarea
                          value={cvData.personalInfo.summary}
                          onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                          placeholder="Özünüz haqqında qısa məlumat..."
                          rows={4}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Telefon</label>
                          <Input
                            value={cvData.personalInfo.phone}
                            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                            placeholder="+994 50 123 45 67"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email *</label>
                          <Input
                            type="email"
                            value={cvData.personalInfo.email}
                            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Yer</label>
                          <Input
                            value={cvData.personalInfo.location}
                            onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                            placeholder="Bakı, Azərbaycan"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="experience" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        İş Təcrübəsi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cvData.workExperience.map((exp) => (
                        <div key={exp.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Təcrübə Girişi</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWorkExperience(exp.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <Input
                              placeholder="İş Başlığı"
                              value={exp.jobTitle}
                              onChange={(e) => updateWorkExperience(exp.id, 'jobTitle', e.target.value)}
                            />
                            <Input
                              placeholder="Şirkət"
                              value={exp.company}
                              onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                            />
                            <Input
                              placeholder="Başlama İli"
                              value={exp.startYear}
                              onChange={(e) => updateWorkExperience(exp.id, 'startYear', e.target.value)}
                            />
                            <Input
                              placeholder="Bitiş İli (və ya Hazırda)"
                              value={exp.endYear}
                              onChange={(e) => updateWorkExperience(exp.id, 'endYear', e.target.value)}
                            />
                          </div>
                          <Textarea
                            placeholder="İş təsviri və nailiyyətlər..."
                            value={exp.description}
                            onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                            rows={3}
                          />
                        </div>
                      ))}
                      <Button onClick={addWorkExperience} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        İş Təcrübəsi Əlavə Et
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Təhsil
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cvData.education.map((edu) => (
                        <div key={edu.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Təhsil Girişi</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(edu.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <Input
                              placeholder="Dərəcə"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            />
                            <Input
                              placeholder="Müəssisə"
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            />
                            <Input
                              placeholder="Başlama İli"
                              value={edu.startYear}
                              onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)}
                            />
                            <Input
                              placeholder="Bitiş İli"
                              value={edu.endYear}
                              onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                      <Button onClick={addEducation} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Təhsil Əlavə Et
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="skills" className="space-y-4">
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Bacarıqlar
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Bacarıq əlavə et"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                          />
                          <Button onClick={addSkill}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cvData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <button onClick={() => removeSkill(index)}>
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Sertifikatlar</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Sertifikat əlavə et"
                            value={newCertification}
                            onChange={(e) => setNewCertification(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                          />
                          <Button onClick={addCertification}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cvData.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {cert}
                              <button onClick={() => removeCertification(index)}>
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Dillər</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Dil əlavə et"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                          />
                          <Button onClick={addLanguage}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cvData.languages.map((language, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {language}
                              <button onClick={() => removeLanguage(index)}>
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Sosial Media Linklər
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-2">
                        <Input
                          placeholder="Platforma (LinkedIn, GitHub və s.)"
                          value={newSocialLink.platform}
                          onChange={(e) => setNewSocialLink(prev => ({ ...prev, platform: e.target.value }))}
                        />
                        <Input
                          placeholder="URL"
                          value={newSocialLink.url}
                          onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                        />
                        <Button onClick={addSocialLink}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {cvData.socialLinks.map((link, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <span className="font-medium">{link.platform}:</span>
                              <span className="ml-2 text-primary">{link.url}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSocialLink(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="hobbies" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Hobbilər və Maraqlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Hobbi və ya maraq əlavə et"
                          value={newHobby}
                          onChange={(e) => setNewHobby(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addHobby()}
                        />
                        <Button onClick={addHobby}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cvData.hobbies.map((hobby, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {hobby}
                            <button onClick={() => removeHobby(index)}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Section - Scrollable */}
            <div className="h-[calc(100vh-200px)] overflow-y-auto">
              <Card className="h-full">
                <CardHeader className="sticky top-0 bg-card z-10 border-b">
                  <CardTitle>Canlı Önizləmə</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* A4 CV Templates with proper sizing and pagination */}
                  <div className="print:shadow-none">
                    {/* A4 Page Container - 210mm x 297mm in 96 DPI */}
                    <div className="w-[794px] max-w-full mx-auto bg-white shadow-2xl" style={{ aspectRatio: '210/297' }}>
                      
                      {/* Template 1 - Modern Creative 2025 */}
                      {cvData.selectedTemplate === 1 && (
                        <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
                          {/* Geometric background pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/20 to-transparent"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-orange-500/30 to-transparent rounded-full blur-3xl"></div>
                          </div>
                          
                          <div className="relative z-10 h-full p-8 flex flex-col">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-8">
                              <div className="flex-1">
                                <h1 className="text-4xl font-light mb-2">
                                  {cvData.personalInfo.fullName || 'Ad Soyad'}
                                </h1>
                                <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 mb-4"></div>
                                <p className="text-xl text-orange-400 font-light tracking-wide">
                                  {cvData.personalInfo.jobTitle || 'Peşə'}
                                </p>
                                <p className="text-slate-300 mt-4 text-sm leading-relaxed max-w-md">
                                  {cvData.personalInfo.summary || 'Şəxsi təqdimat və ixtisaslaşma sahəsi haqqında qısa məlumat.'}
                                </p>
                              </div>
                              
                              {/* Profile Photo */}
                              <div className="ml-8">
                                {cvData.personalInfo.profilePhoto ? (
                                  <img
                                    src={cvData.personalInfo.profilePhoto}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-500 shadow-2xl"
                                  />
                                ) : (
                                  <div className="w-32 h-32 rounded-full bg-slate-700 border-4 border-orange-500 flex items-center justify-center">
                                    <Camera className="w-12 h-12 text-slate-400" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="flex-1 grid grid-cols-3 gap-8">
                              {/* Left Column - Contact & Skills */}
                              <div className="space-y-6">
                                {/* Contact */}
                                <div>
                                  <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                      01
                                    </div>
                                    <h3 className="text-lg font-light uppercase tracking-wider">Əlaqə</h3>
                                  </div>
                                  <div className="space-y-2 text-sm text-slate-300 ml-11">
                                    <div className="flex items-center">
                                      <Mail className="w-4 h-4 mr-2 text-orange-400" />
                                      {cvData.personalInfo.email || 'email@example.com'}
                                    </div>
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 mr-2 text-orange-400" />
                                      {cvData.personalInfo.phone || '+994 50 123 45 67'}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                                      {cvData.personalInfo.location || 'Bakı, Azərbaycan'}
                                    </div>
                                  </div>
                                </div>

                                {/* Skills */}
                                <div>
                                  <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                      02
                                    </div>
                                    <h3 className="text-lg font-light uppercase tracking-wider">Bacarıqlar</h3>
                                  </div>
                                  <div className="space-y-2 ml-11">
                                    {(cvData.skills.length > 0 ? cvData.skills : ['React', 'TypeScript', 'Node.js', 'Design Systems']).map((skill, index) => (
                                      <div key={index} className="flex items-center">
                                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mr-3"></div>
                                        <span className="text-sm text-slate-300">{skill}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Languages */}
                                <div>
                                  <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                      03
                                    </div>
                                    <h3 className="text-lg font-light uppercase tracking-wider">Dillər</h3>
                                  </div>
                                  <div className="space-y-2 ml-11">
                                    {(cvData.languages.length > 0 ? cvData.languages : ['Azərbaycan', 'İngilis', 'Türk']).map((language, index) => (
                                      <div key={index} className="flex justify-between items-center text-sm">
                                        <span className="text-slate-300">{language}</span>
                                        <span className="text-orange-400 font-semibold">C1</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Right Columns - Experience & Education */}
                              <div className="col-span-2 space-y-8">
                                {/* Experience */}
                                <div>
                                  <div className="flex items-center mb-6">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                      04
                                    </div>
                                    <h3 className="text-lg font-light uppercase tracking-wider">Təcrübə</h3>
                                  </div>
                                  <div className="space-y-6 ml-11">
                                    {(cvData.workExperience.length > 0 ? cvData.workExperience : [
                                      {
                                        id: '1',
                                        jobTitle: 'Senior Developer',
                                        company: 'Tech Company',
                                        startYear: '2020',
                                        endYear: 'Hazırda',
                                        description: 'Modern veb və mobil aplikasiyalar üzərində işləyərək, React, Node.js və cloud texnologiyalarından istifadə edirəm.'
                                      },
                                      {
                                        id: '2',
                                        jobTitle: 'Frontend Developer',
                                        company: 'Digital Agency',
                                        startYear: '2018',
                                        endYear: '2020',
                                        description: 'Müxtəlif brendlər üçün responsiv veb saytlar və istifadəçi interfeysi komponentləri hazırladım.'
                                      }
                                    ]).map((exp, index) => (
                                      <div key={exp.id || index} className="relative">
                                        <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-orange-500 to-transparent opacity-30"></div>
                                        <div className="pl-6">
                                          <div className="text-sm text-orange-400 font-semibold mb-1">
                                            {exp.startYear} - {exp.endYear}
                                          </div>
                                          <h4 className="text-lg font-semibold text-white mb-1">
                                            {exp.jobTitle}
                                          </h4>
                                          <p className="text-slate-400 text-sm mb-2">{exp.company}</p>
                                          <p className="text-slate-300 text-sm leading-relaxed">
                                            {exp.description}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Education */}
                                <div>
                                  <div className="flex items-center mb-6">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                      05
                                    </div>
                                    <h3 className="text-lg font-light uppercase tracking-wider">Təhsil</h3>
                                  </div>
                                  <div className="space-y-4 ml-11">
                                    {(cvData.education.length > 0 ? cvData.education : [
                                      {
                                        id: '1',
                                        degree: 'Kompüter Mühəndisliği',
                                        institution: 'Azərbaycan Texniki Universiteti',
                                        startYear: '2014',
                                        endYear: '2018'
                                      }
                                    ]).map((edu, index) => (
                                      <div key={edu.id || index} className="pl-6 border-l border-slate-700">
                                        <div className="text-sm text-orange-400 font-semibold mb-1">
                                          {edu.startYear} - {edu.endYear}
                                        </div>
                                        <h4 className="text-white font-semibold mb-1">{edu.degree}</h4>
                                        <p className="text-slate-400 text-sm">{edu.institution}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Template 2 - Classic Business */}
                      {cvData.selectedTemplate === 2 && (
                        <div className="h-full bg-white p-8 flex flex-col">
                          {/* Header */}
                          <div className="border-b-2 border-blue-900 pb-6 mb-8">
                            <div className="flex items-center justify-between">
                              <div>
                                <h1 className="text-3xl font-bold text-blue-900 mb-2">
                                  {cvData.personalInfo.fullName || 'Ad Soyad'}
                                </h1>
                                <p className="text-lg text-gray-600">
                                  {cvData.personalInfo.jobTitle || 'Peşə'}
                                </p>
                              </div>
                              {cvData.personalInfo.profilePhoto && (
                                <img
                                  src={cvData.personalInfo.profilePhoto}
                                  alt="Profile"
                                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-900"
                                />
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 grid grid-cols-3 gap-8">
                            <div className="col-span-2 space-y-6">
                              <div>
                                <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-gray-300 pb-2">Təcrübə</h3>
                                {/* Experience content */}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-blue-900 mb-4">Əlaqə</h3>
                              {/* Contact content */}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Template 3 - Minimal Elegant */}
                      {cvData.selectedTemplate === 3 && (
                        <div className="h-full bg-gray-50 p-8">
                          <div className="bg-white h-full shadow-lg p-8">
                            <h1 className="text-2xl font-light text-center text-gray-800 mb-8">
                              {cvData.personalInfo.fullName || 'Ad Soyad'}
                            </h1>
                            {/* Minimal template content */}
                          </div>
                        </div>
                      )}

                      {/* Template 4 - Tech Style */}
                      {cvData.selectedTemplate === 4 && (
                        <div className="h-full bg-black text-green-400 p-8 font-mono">
                          <div className="border border-green-400 h-full p-6">
                            <h1 className="text-2xl mb-4">
                              {cvData.personalInfo.fullName || 'user@terminal:~$'}
                            </h1>
                            {/* Tech template content */}
                          </div>
                        </div>
                      )}

                      {/* Template 5 - Premium Gold */}
                      {cvData.selectedTemplate === 5 && (
                        <div className="h-full bg-gradient-to-br from-amber-50 to-orange-50 p-8">
                          <div className="bg-white h-full shadow-xl border-t-4 border-amber-500 p-8">
                            <h1 className="text-3xl font-serif text-amber-800 mb-6">
                              {cvData.personalInfo.fullName || 'Ad Soyad'}
                            </h1>
                            {/* Premium template content */}
                          </div>
                        </div>
                      )}
                      
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 xl:bottom-6 right-6 flex flex-col gap-3 z-20">
        <Button
          onClick={downloadPDF}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
          title="PDF Yüklə"
        >
          <Download className="w-5 h-5" />
        </Button>
        <Button
          onClick={resetAll}
          variant="destructive"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
          title="Hamısını Sıfırla"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default CVBuilder;