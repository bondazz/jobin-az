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
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">CV Builder</h1>
            <p className="text-lg text-muted-foreground">Dəqiqələr ərzində peşəkar CV hazırlayın</p>
          </div>

          {/* Template Selection - Compact */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Şablon Seçin</h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {[1, 2, 3, 4, 5].map((template) => (
                <div
                  key={template}
                  className={`cursor-pointer border-2 rounded-lg p-3 transition-all hover:shadow-md min-w-[120px] ${
                    cvData.selectedTemplate === template
                      ? 'border-primary shadow-md bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setCvData(prev => ({ ...prev, selectedTemplate: template }))}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded mb-2 flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground">
                      {template === 1 ? '🎨' : template === 2 ? '💼' : template === 3 ? '✨' : template === 4 ? '🚀' : '🌟'}
                    </span>
                  </div>
                  <h3 className="font-medium text-center text-sm">
                    {template === 1 ? 'Modern' : 
                     template === 2 ? 'Klassik' : 
                     template === 3 ? 'Minimal' : 
                     template === 4 ? 'Texnoloji' : 
                     'Premium'}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form Section - Improved Scrolling */}
            <div className="bg-card rounded-lg shadow-sm border">
              <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b p-4 z-10">
                <h2 className="font-semibold text-lg">CV Məlumatları</h2>
              </div>
              <div className="h-[calc(100vh-280px)] overflow-y-auto scroll-smooth">
                <div className="p-4 space-y-6">
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
              </div>
            </div>

            {/* Preview Section - Improved Scrolling */}
            <div className="bg-card rounded-lg shadow-sm border">
              <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b p-4 z-10">
                <h2 className="font-semibold text-lg">Canlı Önizləmə</h2>
              </div>
              <div className="h-[calc(100vh-280px)] overflow-y-auto scroll-smooth">
                <div className="p-4">
                  {/* A4 Format CV Preview */}
                  <div className="w-full max-w-[210mm] mx-auto bg-white shadow-lg" style={{ aspectRatio: '210/297' }}>
                    {cvData.selectedTemplate === 1 && (
                      <div className="h-full flex">
                        {/* Left Sidebar - Dark */}
                        <div className="w-1/3 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 text-white p-6 relative overflow-hidden">
                          {/* Decorative grain texture */}
                          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M0 0h20v20H0z%22/%3E%3Cpath d=%22M2 2h16v16H2z%22/%3E%3C/g%3E%3C/svg%3E')]"></div>
                          
                          <div className="relative z-10">
                            {/* Profile Photo */}
                            <div className="mb-6 text-center">
                              {cvData.personalInfo.profilePhoto ? (
                                <img
                                  src={cvData.personalInfo.profilePhoto}
                                  alt="Profile"
                                  className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-orange-400"
                                />
                              ) : (
                                <div className="w-28 h-28 rounded-full mx-auto bg-gray-600 flex items-center justify-center border-4 border-orange-400">
                                  <Camera className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Contact Info */}
                            <div className="mb-6">
                              <h3 className="text-orange-400 font-bold text-lg mb-3 flex items-center">
                                <span className="bg-orange-400 text-slate-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">1</span>
                                ƏLAQƏ
                              </h3>
                              <div className="space-y-2 text-sm">
                                {cvData.personalInfo.phone && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-orange-400" />
                                    <span>{cvData.personalInfo.phone}</span>
                                  </div>
                                )}
                                {cvData.personalInfo.email && (
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-orange-400" />
                                    <span className="break-all">{cvData.personalInfo.email}</span>
                                  </div>
                                )}
                                {cvData.personalInfo.location && (
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                                    <span>{cvData.personalInfo.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Skills */}
                            {cvData.skills.length > 0 && (
                              <div className="mb-6">
                                <h3 className="text-orange-400 font-bold text-lg mb-3 flex items-center">
                                  <span className="bg-orange-400 text-slate-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">2</span>
                                  BACARIQLAR
                                </h3>
                                <div className="space-y-2">
                                  {cvData.skills.map((skill, index) => (
                                    <div key={index} className="text-sm">
                                      <div className="bg-gray-700 rounded-full h-2 mb-1">
                                        <div className="bg-orange-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                                      </div>
                                      <span className="text-xs">{skill}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Languages */}
                            {cvData.languages.length > 0 && (
                              <div className="mb-6">
                                <h3 className="text-orange-400 font-bold text-lg mb-3 flex items-center">
                                  <span className="bg-orange-400 text-slate-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">3</span>
                                  DİLLƏR
                                </h3>
                                <div className="space-y-1">
                                  {cvData.languages.map((language, index) => (
                                    <div key={index} className="text-sm">{language}</div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Social Links */}
                            {cvData.socialLinks.length > 0 && (
                              <div>
                                <h3 className="text-orange-400 font-bold text-lg mb-3 flex items-center">
                                  <span className="bg-orange-400 text-slate-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">4</span>
                                  SOSIAL
                                </h3>
                                <div className="space-y-1">
                                  {cvData.socialLinks.map((link, index) => (
                                    <div key={index} className="text-xs">
                                      <span className="text-orange-400">{link.platform}:</span>
                                      <span className="ml-1 break-all">{link.url}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Content */}
                        <div className="w-2/3 bg-white p-6">
                          {/* Header */}
                          <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">
                              {cvData.personalInfo.fullName || 'TAM ADINIZ'}
                            </h1>
                            <h2 className="text-lg text-orange-500 font-semibold mb-4">
                              {cvData.personalInfo.jobTitle || 'İŞ BAŞLIĞINIZ'}
                            </h2>
                            {cvData.personalInfo.summary && (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {cvData.personalInfo.summary}
                              </p>
                            )}
                          </div>

                          {/* Experience */}
                          {cvData.workExperience.length > 0 && (
                            <div className="mb-6">
                              <h3 className="text-orange-500 font-bold text-lg mb-4 flex items-center">
                                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">5</span>
                                İŞ TƏCRÜBƏSİ
                              </h3>
                              <div className="space-y-4">
                                {cvData.workExperience.map((exp) => (
                                  <div key={exp.id} className="border-l-4 border-orange-400 pl-4">
                                    <h4 className="font-semibold text-slate-800">{exp.jobTitle}</h4>
                                    <p className="text-orange-500 font-medium">{exp.company}</p>
                                    <p className="text-xs text-gray-500 mb-2">{exp.startYear} - {exp.endYear}</p>
                                    {exp.description && (
                                      <p className="text-sm text-gray-600">{exp.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Education */}
                          {cvData.education.length > 0 && (
                            <div className="mb-6">
                              <h3 className="text-orange-500 font-bold text-lg mb-4 flex items-center">
                                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">6</span>
                                TƏHSİL
                              </h3>
                              <div className="space-y-3">
                                {cvData.education.map((edu) => (
                                  <div key={edu.id} className="border-l-4 border-orange-400 pl-4">
                                    <h4 className="font-semibold text-slate-800">{edu.degree}</h4>
                                    <p className="text-orange-500 font-medium">{edu.institution}</p>
                                    <p className="text-xs text-gray-500">{edu.startYear} - {edu.endYear}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Certifications & Hobbies */}
                          {(cvData.certifications.length > 0 || cvData.hobbies.length > 0) && (
                            <div className="grid grid-cols-1 gap-4">
                              {cvData.certifications.length > 0 && (
                                <div>
                                  <h3 className="text-orange-500 font-bold text-lg mb-3 flex items-center">
                                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">7</span>
                                    SERTİFİKATLAR
                                  </h3>
                                  <div className="flex flex-wrap gap-1">
                                    {cvData.certifications.map((cert, index) => (
                                      <span key={index} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                        {cert}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {cvData.hobbies.length > 0 && (
                                <div>
                                  <h3 className="text-orange-500 font-bold text-lg mb-3 flex items-center">
                                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">8</span>
                                    HOBBİLƏR
                                  </h3>
                                  <div className="flex flex-wrap gap-1">
                                    {cvData.hobbies.map((hobby, index) => (
                                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                        {hobby}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Template 2 */}
                    {cvData.selectedTemplate === 2 && (
                      <div className="h-full p-8 bg-white">
                        <div className="text-center mb-8 border-b-2 border-blue-600 pb-4">
                          {cvData.personalInfo.profilePhoto && (
                            <img
                              src={cvData.personalInfo.profilePhoto}
                              alt="Profile"
                              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                            />
                          )}
                          <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            {cvData.personalInfo.fullName || 'TAM ADINIZ'}
                          </h1>
                          <h2 className="text-lg text-blue-600 mb-4">
                            {cvData.personalInfo.jobTitle || 'İŞ BAŞLIĞINIZ'}
                          </h2>
                          <div className="flex justify-center space-x-4 text-sm text-gray-600">
                            {cvData.personalInfo.email && <span>{cvData.personalInfo.email}</span>}
                            {cvData.personalInfo.phone && <span>{cvData.personalInfo.phone}</span>}
                            {cvData.personalInfo.location && <span>{cvData.personalInfo.location}</span>}
                          </div>
                        </div>

                        {cvData.personalInfo.summary && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-blue-600 mb-2 border-b border-gray-300">XÜLASƏ</h3>
                            <p className="text-sm text-gray-700">{cvData.personalInfo.summary}</p>
                          </div>
                        )}

                        {/* Rest of Template 2 content... */}
                        {cvData.workExperience.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-blue-600 mb-3 border-b border-gray-300">İŞ TƏCRÜBƏSİ</h3>
                            {cvData.workExperience.map((exp) => (
                              <div key={exp.id} className="mb-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold">{exp.jobTitle}</h4>
                                    <p className="text-blue-600">{exp.company}</p>
                                  </div>
                                  <span className="text-sm text-gray-500">{exp.startYear} - {exp.endYear}</span>
                                </div>
                                {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Template 3 */}
                    {cvData.selectedTemplate === 3 && (
                      <div className="h-full p-8 bg-gray-50">
                        <div className="mb-6">
                          <h1 className="text-3xl font-light text-gray-800 mb-1">
                            {cvData.personalInfo.fullName || 'TAM ADINIZ'}
                          </h1>
                          <h2 className="text-lg text-gray-600 mb-4">
                            {cvData.personalInfo.jobTitle || 'İŞ BAŞLIĞINIZ'}
                          </h2>
                          <div className="text-sm text-gray-600 space-y-1">
                            {cvData.personalInfo.email && <div>{cvData.personalInfo.email}</div>}
                            {cvData.personalInfo.phone && <div>{cvData.personalInfo.phone}</div>}
                            {cvData.personalInfo.location && <div>{cvData.personalInfo.location}</div>}
                          </div>
                        </div>

                        {cvData.personalInfo.summary && (
                          <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed">{cvData.personalInfo.summary}</p>
                          </div>
                        )}

                        {/* Minimal template content continues... */}
                      </div>
                    )}

                    {/* Template 4 */}
                    {cvData.selectedTemplate === 4 && (
                      <div className="h-full bg-gradient-to-br from-slate-900 to-blue-900 text-white p-8">
                        <div className="border border-blue-400 rounded-lg p-6 mb-6">
                          <h1 className="text-2xl font-bold mb-2 text-blue-300">
                            {cvData.personalInfo.fullName || 'TAM ADINIZ'}
                          </h1>
                          <h2 className="text-lg text-blue-200 mb-4">
                            {cvData.personalInfo.jobTitle || 'İŞ BAŞLIĞINIZ'}
                          </h2>
                          {cvData.personalInfo.summary && (
                            <p className="text-sm text-gray-300">{cvData.personalInfo.summary}</p>
                          )}
                        </div>

                        {/* Tech template content continues... */}
                      </div>
                    )}

                    {/* Template 5 */}
                    {cvData.selectedTemplate === 5 && (
                      <div className="h-full bg-gradient-to-br from-amber-50 to-orange-100 p-8">
                        <div className="text-center mb-8">
                          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mb-4"></div>
                          <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {cvData.personalInfo.fullName || 'TAM ADINIZ'}
                          </h1>
                          <h2 className="text-xl text-orange-600 mb-4">
                            {cvData.personalInfo.jobTitle || 'İŞ BAŞLIĞINIZ'}
                          </h2>
                          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto"></div>
                        </div>

                        {/* Premium template content continues... */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-24 xl:bottom-8 right-8 flex flex-col gap-4 z-50">
            <Button
              onClick={downloadPDF}
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all bg-primary"
              title="PDF Yüklə"
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              onClick={resetAll}
              variant="outline"
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
              title="Hamısını Sıfırla"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;