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

          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Form Section */}
            <div className="space-y-6">
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
                    {/* Skills */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Bacarıqlar</CardTitle>
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

                    {/* Certifications */}
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
                        <div className="space-y-2">
                          {cvData.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span>{cert}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCertification(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Languages */}
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
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
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

            {/* Preview Section */}
            <div className="lg:sticky lg:top-6 h-fit">
              <Card className="min-h-[800px]">
                <CardHeader>
                  <CardTitle>Canlı Önizləmə</CardTitle>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((template) => (
                      <Button
                        key={template}
                        variant={cvData.selectedTemplate === template ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCvData(prev => ({ ...prev, selectedTemplate: template }))}
                      >
                        Şablon {template}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                   {/* CV Preview - Template 1 Modern Design */}
                  {cvData.selectedTemplate === 1 && (
                    <div className="bg-stone-50 shadow-xl rounded-lg overflow-hidden min-h-[842px] max-w-[595px] mx-auto relative">
                      {/* Background grain texture */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3Ccircle cx="27" cy="7" r="1"/%3E%3Ccircle cx="47" cy="7" r="1"/%3E%3Ccircle cx="7" cy="27" r="1"/%3E%3Ccircle cx="27" cy="27" r="1"/%3E%3Ccircle cx="47" cy="27" r="1"/%3E%3Ccircle cx="7" cy="47" r="1"/%3E%3Ccircle cx="27" cy="47" r="1"/%3E%3Ccircle cx="47" cy="47" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                          backgroundSize: '15px 15px'
                        }}
                      ></div>
                      
                      {/* Blur overlay */}
                      <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-sm"></div>
                      
                      <div className="flex h-full relative z-10">
                        {/* Left Sidebar - Dark Blue/Gray */}
                        <div className="w-2/5 bg-slate-800 text-white p-8 space-y-8">
                          {/* Profile Photo */}
                          <div className="flex justify-center mb-8">
                            {cvData.personalInfo.profilePhoto ? (
                              <img
                                src={cvData.personalInfo.profilePhoto}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                              />
                            ) : (
                              <div className="w-32 h-32 rounded-full bg-slate-600 border-4 border-white shadow-lg flex items-center justify-center">
                                <Camera className="w-12 h-12 text-slate-300" />
                              </div>
                            )}
                          </div>

                          {/* Name and Title Header */}
                          <div className="text-center border-b border-slate-600 pb-6">
                            <h1 className="text-xl font-light text-white mb-2">
                              {cvData.personalInfo.fullName || 'John Doe'}
                            </h1>
                            <p className="text-sm text-slate-300 uppercase tracking-wider">
                              {cvData.personalInfo.jobTitle || 'Full Stack Developer'}
                            </p>
                          </div>

                          {/* Contacts */}
                          <div>
                            <h3 className="text-base font-light text-white mb-4 uppercase tracking-widest flex items-center">
                              <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">01</span>
                              Əlaqə
                            </h3>
                            <div className="space-y-3 text-sm text-slate-200 ml-11">
                              {cvData.socialLinks.map((link, index) => (
                                <div key={index} className="flex items-center">
                                  <span className="text-orange-400 mr-2">▶</span>
                                  {link.platform.toLowerCase()}.com/username
                                </div>
                              ))}
                              <div className="flex items-center">
                                <span className="text-orange-400 mr-2">▶</span>
                                {cvData.personalInfo.email || 'username@email.com'}
                              </div>
                              <div className="flex items-center">
                                <span className="text-orange-400 mr-2">▶</span>
                                {cvData.personalInfo.phone || '+0 000 000 0000'}
                              </div>
                            </div>
                          </div>

                          {/* Skills */}
                          <div>
                            <h3 className="text-base font-light text-white mb-4 uppercase tracking-widest flex items-center">
                              <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">04</span>
                              Bacarıqlar
                            </h3>
                            <div className="space-y-2 ml-11">
                              {cvData.skills.length > 0 ? cvData.skills.map((skill, index) => (
                                <div key={index} className="flex items-center">
                                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                                  <span className="text-sm text-slate-200">{skill}</span>
                                </div>
                              )) : (
                                <>
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                                    <span className="text-sm text-slate-200">React Native</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                                    <span className="text-sm text-slate-200">JavaScript</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                                    <span className="text-sm text-slate-200">TypeScript</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Languages */}
                          <div>
                            <h3 className="text-base font-light text-white mb-4 uppercase tracking-widest flex items-center">
                              <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">05</span>
                              Dillər
                            </h3>
                            <div className="space-y-3 ml-11">
                              {cvData.languages.length > 0 ? cvData.languages.map((language, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-sm text-slate-200">{language}</span>
                                  <span className="text-sm text-orange-400 font-semibold">C2</span>
                                </div>
                              )) : (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-200">İngilis</span>
                                    <span className="text-sm text-orange-400 font-semibold">C2</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-200">İtalyan</span>
                                    <span className="text-sm text-orange-400 font-semibold">C1</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-200">İspan</span>
                                    <span className="text-sm text-orange-400 font-semibold">B2</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 p-8 bg-white relative">
                          {/* Experience */}
                          <div className="mb-8">
                            <h3 className="text-lg font-light text-gray-900 mb-6 uppercase tracking-widest flex items-center">
                              <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4">02</span>
                              Təcrübə
                            </h3>
                            <div className="space-y-8 ml-12">
                              {cvData.workExperience.length > 0 ? cvData.workExperience.map((exp, index) => (
                                <div key={exp.id} className="relative">
                                  <div className="mb-3">
                                    <div className="text-sm text-gray-600 mb-2">
                                      {exp.startYear}.09 - {exp.endYear === 'Present' ? 'Hazırda' : exp.endYear}
                                    </div>
                                    <h4 className="font-semibold text-gray-900 text-base mb-3">{exp.company || 'Şirkət adı'}</h4>
                                    <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                                      <p>{exp.description || 'Android və iOS appların dizaynında təcrübə. Layout, tipografiya və vizual ierarxiyanın başa düşülməsi.'}</p>
                                      <p>Redaksiya, biznes və istifadəçinin ehtiyacları arasında balansın başa düşülməsi.</p>
                                      <p>Responsiv veb platformlar üçün dizayn təcrübəsi.</p>
                                    </div>
                                  </div>
                                </div>
                              )) : (
                                <>
                                  <div className="relative">
                                    <div className="mb-3">
                                      <div className="text-sm text-gray-600 mb-2">2016.09 - Hazırda</div>
                                      <h4 className="font-semibold text-gray-900 text-base mb-3">Şirkət adı</h4>
                                      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                                        <p>Android və iOS appların dizaynında təcrübə. Layout, tipografiya və vizual ierarxiyanın başa düşülməsi.</p>
                                        <p>Redaksiya, biznes və istifadəçinin ehtiyacları arasında balansın başa düşülməsi.</p>
                                        <p>Responsiv veb platformlar üçün dizayn təcrübəsi.</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <div className="mb-3">
                                      <div className="text-sm text-gray-600 mb-2">2014.09 - 2016.08</div>
                                      <h4 className="font-semibold text-gray-900 text-base mb-3">Şirkət adı</h4>
                                      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                                        <p>Layout, tipografiya və vizual ierarxiya bacarıqlarının inkişafı.</p>
                                        <p>İstifadəçi təcrübəsi dizaynı və məhsul strategiyası.</p>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Education */}
                          <div>
                            <h3 className="text-lg font-light text-gray-900 mb-6 uppercase tracking-widest flex items-center">
                              <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4">03</span>
                              Təhsil
                            </h3>
                            <div className="space-y-4 ml-12">
                              {cvData.education.length > 0 ? cvData.education.map((edu) => (
                                <div key={edu.id}>
                                  <div className="text-sm text-gray-600 mb-1">{edu.startYear}-{edu.endYear}</div>
                                  <h4 className="font-semibold text-gray-900 text-base">{edu.institution || 'Idaho State University'}</h4>
                                  <p className="text-sm text-gray-700">{edu.degree || 'Business Informatics'}</p>
                                </div>
                              )) : (
                                <div>
                                  <div className="text-sm text-gray-600 mb-1">2014-2019</div>
                                  <h4 className="font-semibold text-gray-900 text-base">Idaho State University</h4>
                                  <p className="text-sm text-gray-700">Business Informatics</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other templates */}
                  {cvData.selectedTemplate !== 1 && (
                    <div className="bg-white text-black p-8 rounded-lg shadow-lg min-h-[700px] text-sm">
                      {/* Header */}
                      <div className="flex items-start gap-6 mb-6">
                        {cvData.personalInfo.profilePhoto && (
                          <img
                            src={cvData.personalInfo.profilePhoto}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {cvData.personalInfo.fullName || 'Sizin Adınız'}
                          </h1>
                          <h2 className="text-xl text-gray-600 mb-3">
                            {cvData.personalInfo.jobTitle || 'Sizin İş Başlığınız'}
                          </h2>
                          <div className="flex flex-wrap gap-4 text-gray-600">
                            {cvData.personalInfo.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {cvData.personalInfo.phone}
                              </div>
                            )}
                            {cvData.personalInfo.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {cvData.personalInfo.email}
                              </div>
                            )}
                            {cvData.personalInfo.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {cvData.personalInfo.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      {cvData.personalInfo.summary && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Xülasə</h3>
                          <p className="text-gray-700 leading-relaxed">{cvData.personalInfo.summary}</p>
                        </div>
                      )}

                      {/* Work Experience */}
                      {cvData.workExperience.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">İş Təcrübəsi</h3>
                          <div className="space-y-4">
                            {cvData.workExperience.map((exp) => (
                              <div key={exp.id}>
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-medium text-gray-900">{exp.jobTitle}</h4>
                                  <span className="text-gray-600 text-sm">{exp.startYear} - {exp.endYear}</span>
                                </div>
                                <p className="text-gray-700 font-medium mb-2">{exp.company}</p>
                                {exp.description && (
                                  <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {cvData.education.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Təhsil</h3>
                          <div className="space-y-3">
                            {cvData.education.map((edu) => (
                              <div key={edu.id}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                                    <p className="text-gray-700">{edu.institution}</p>
                                  </div>
                                  <span className="text-gray-600 text-sm">{edu.startYear} - {edu.endYear}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {cvData.skills.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bacarıqlar</h3>
                          <div className="flex flex-wrap gap-2">
                            {cvData.skills.map((skill, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {cvData.certifications.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sertifikatlar</h3>
                          <div className="space-y-2">
                            {cvData.certifications.map((cert, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span className="text-gray-700">{cert}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Languages */}
                      {cvData.languages.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Dillər</h3>
                          <div className="flex flex-wrap gap-2">
                            {cvData.languages.map((language, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                {language}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Social Links */}
                      {cvData.socialLinks.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sosial Linklər</h3>
                          <div className="space-y-2">
                            {cvData.socialLinks.map((link, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-700 font-medium">{link.platform}:</span>
                                <span className="text-blue-600 hover:underline cursor-pointer">{link.url}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hobbies */}
                      {cvData.hobbies.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Hobbilər və Maraqlar</h3>
                          <div className="flex flex-wrap gap-2">
                            {cvData.hobbies.map((hobby, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                {hobby}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
