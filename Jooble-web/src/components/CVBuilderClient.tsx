"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, RefreshCw, Plus, Trash2, Upload, User, Briefcase, GraduationCap, Award, Globe, Heart, Phone, Mail, MapPin, Camera } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

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

const CVBuilderClient = () => {
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
    const cvPreviewRef = useRef<HTMLDivElement>(null);

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

    const downloadPDF = async () => {
        if (!cvPreviewRef.current) return;

        try {
            toast.info('PDF hazırlanır...');

            const element = cvPreviewRef.current;

            // A4 dimensions in pixels (at 96 DPI)
            const a4Width = 794;
            const a4Height = 1123;

            // Generate canvas from the element
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: a4Width
            });

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [a4Width, a4Height]
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add additional pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            const fileName = cvData.personalInfo.fullName
                ? `${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`
                : 'CV.pdf';

            pdf.save(fileName);
            toast.success('PDF uğurla yükləndi!');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('PDF hazırlanarkən xəta baş verdi');
        }
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

            <div className="pt-12 xl:pt-0 pb-16 xl:pb-0">
                <div className="container mx-auto px-2 lg:px-4 py-2 max-w-7xl">
                    {/* Header - Minimized */}
                    <div className="text-center mb-3">
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">CV Builder</h1>
                        <p className="text-sm text-muted-foreground">Dəqiqələr ərzində peşəkar CV hazırlayın</p>
                    </div>

                    {/* Template Selection - Ultra Compact */}
                    <div className="mb-4">
                        <div className="flex justify-center items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-muted-foreground mr-2">Şablon:</span>
                            {[1, 2, 3, 4, 5].map((template) => (
                                <button
                                    key={template}
                                    className={`w-12 h-16 rounded border-2 transition-all text-xs font-medium ${cvData.selectedTemplate === template
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border hover:border-primary/50 text-muted-foreground'
                                        }`}
                                    onClick={() => setCvData(prev => ({ ...prev, selectedTemplate: template }))}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <span className="text-lg">
                                            {template === 1 ? '🎨' : template === 2 ? '💼' : template === 3 ? '✨' : template === 4 ? '🚀' : '🌟'}
                                        </span>
                                        <span className="mt-1">{template}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-3">
                        {/* Form Section - Optimized Scrolling */}
                        <div className="bg-card rounded-lg shadow-sm border">
                            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b p-3 z-10">
                                <h2 className="font-semibold text-base">CV Məlumatları</h2>
                            </div>
                            <div className="h-[calc(100vh-200px)] overflow-y-auto scroll-smooth">
                                <div className="p-3 space-y-4">
                                    <Tabs defaultValue="personal" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 h-10">
                                            <TabsTrigger value="personal" className="text-xs">
                                                <User className="w-3 h-3 mr-1" />
                                                <span className="hidden sm:inline">Şəxsi</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="experience" className="text-xs">
                                                <Briefcase className="w-3 h-3 mr-1" />
                                                <span className="hidden sm:inline">Təcrübə</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="education" className="text-xs">
                                                <GraduationCap className="w-3 h-3 mr-1" />
                                                <span className="hidden sm:inline">Təhsil</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="skills" className="text-xs">
                                                <Award className="w-3 h-3 mr-1" />
                                                <span className="hidden sm:inline">Bacarıqlar</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="social" className="text-xs">
                                                <Globe className="w-3 h-3 mr-1" />
                                                <span className="hidden sm:inline">Sosial</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="hobbies" className="text-xs">
                                                <Heart className="w-3 h-3 mr-1" />
                                                <span className="hidden sm:inline">Hobbilər</span>
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="personal" className="space-y-3">
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <User className="w-4 h-4" />
                                                        Şəxsi Məlumatlar
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {/* Profile Photo Upload */}
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="relative">
                                                            {cvData.personalInfo.profilePhoto ? (
                                                                <img
                                                                    src={cvData.personalInfo.profilePhoto}
                                                                    alt="Profile"
                                                                    className="w-24 h-24 rounded-full object-cover border-4 border-border"
                                                                    width="96"
                                                                    height="96"
                                                                />
                                                            ) : (
                                                                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                                                                    <Camera className="w-6 h-6 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                                                                <Upload className="w-3 h-3" />
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={handleImageUpload}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">Tövsiyə olunan: 150x150px</p>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-3">
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
                                                            rows={3}
                                                        />
                                                    </div>

                                                    <div className="grid md:grid-cols-3 gap-3">
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

                                        <TabsContent value="experience" className="space-y-3">
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <Briefcase className="w-4 h-4" />
                                                        İş Təcrübəsi
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {cvData.workExperience.map((exp) => (
                                                        <div key={exp.id} className="p-3 border rounded-lg space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-medium text-sm">Təcrübə Girişi</h4>
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
                                                                    placeholder="İş başlığı"
                                                                    value={exp.jobTitle}
                                                                    onChange={(e) => updateWorkExperience(exp.id, 'jobTitle', e.target.value)}
                                                                />
                                                                <Input
                                                                    placeholder="Şirkət adı"
                                                                    value={exp.company}
                                                                    onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                                                                />
                                                                <Input
                                                                    placeholder="Başlama ili"
                                                                    value={exp.startYear}
                                                                    onChange={(e) => updateWorkExperience(exp.id, 'startYear', e.target.value)}
                                                                />
                                                                <Input
                                                                    placeholder="Bitirmə ili"
                                                                    value={exp.endYear}
                                                                    onChange={(e) => updateWorkExperience(exp.id, 'endYear', e.target.value)}
                                                                />
                                                            </div>
                                                            <Textarea
                                                                placeholder="İş təsviri və nailiyyətlər"
                                                                value={exp.description}
                                                                onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                                                                rows={2}
                                                            />
                                                        </div>
                                                    ))}
                                                    <Button onClick={addWorkExperience} className="w-full">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        İş Təcrübəsi Əlavə Et
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="education" className="space-y-3">
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <GraduationCap className="w-4 h-4" />
                                                        Təhsil
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {cvData.education.map((edu) => (
                                                        <div key={edu.id} className="p-3 border rounded-lg space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-medium text-sm">Təhsil Girişi</h4>
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
                                                                    placeholder="Dərəcə/Diploma"
                                                                    value={edu.degree}
                                                                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                                />
                                                                <Input
                                                                    placeholder="Müəssisə adı"
                                                                    value={edu.institution}
                                                                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                                                />
                                                                <Input
                                                                    placeholder="Başlama ili"
                                                                    value={edu.startYear}
                                                                    onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)}
                                                                />
                                                                <Input
                                                                    placeholder="Bitirmə ili"
                                                                    value={edu.endYear}
                                                                    onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button onClick={addEducation} className="w-full">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Təhsil Əlavə Et
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="skills" className="space-y-3">
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <Award className="w-4 h-4" />
                                                        Bacarıqlar və Sertifikatlar
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {/* Skills */}
                                                    <div>
                                                        <label className="text-sm font-medium mb-2 block">Bacarıqlar</label>
                                                        <div className="flex gap-2 mb-2">
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
                                                    </div>

                                                    <Separator />

                                                    {/* Certifications */}
                                                    <div>
                                                        <label className="text-sm font-medium mb-2 block">Sertifikatlar</label>
                                                        <div className="flex gap-2 mb-2">
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
                                                                <Badge key={index} variant="outline" className="flex items-center gap-1">
                                                                    {cert}
                                                                    <button onClick={() => removeCertification(index)}>
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    {/* Languages */}
                                                    <div>
                                                        <label className="text-sm font-medium mb-2 block">Dillər</label>
                                                        <div className="flex gap-2 mb-2">
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
                                                                <Badge key={index} variant="default" className="flex items-center gap-1">
                                                                    {language}
                                                                    <button onClick={() => removeLanguage(index)}>
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="social" className="space-y-3">
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <Globe className="w-4 h-4" />
                                                        Sosial Şəbəkələr
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input
                                                            placeholder="Platform (LinkedIn)"
                                                            value={newSocialLink.platform}
                                                            onChange={(e) => setNewSocialLink(prev => ({ ...prev, platform: e.target.value }))}
                                                        />
                                                        <Input
                                                            placeholder="URL"
                                                            value={newSocialLink.url}
                                                            onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                                                        />
                                                    </div>
                                                    <Button onClick={addSocialLink} className="w-full">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Sosial Link Əlavə Et
                                                    </Button>
                                                    <div className="space-y-2">
                                                        {cvData.socialLinks.map((link, index) => (
                                                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                                <span className="text-sm">
                                                                    <strong>{link.platform}:</strong> {link.url}
                                                                </span>
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

                                        <TabsContent value="hobbies" className="space-y-3">
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <Heart className="w-4 h-4" />
                                                        Hobbilər və Maraqlar
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
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

                        {/* Preview Section - A4 Format with Pagination */}
                        <div className="bg-card rounded-lg shadow-sm border">
                            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b p-3 z-10">
                                <h2 className="font-semibold text-base">Canlı Önizləmə (A4)</h2>
                            </div>
                            <ScrollArea className="h-[calc(100vh-200px)]">
                                <div className="p-4 bg-muted/30">
                                    {/* A4 Format CV Preview */}
                                    <div
                                        ref={cvPreviewRef}
                                        className="w-full mx-auto bg-white shadow-xl border-2 border-gray-300"
                                        style={{
                                            maxWidth: '210mm',
                                            minHeight: '297mm',
                                            aspectRatio: '210 / 297',
                                            transformOrigin: 'top center',
                                            fontSize: '12pt',
                                            lineHeight: '1.5'
                                        }}
                                    >
                                        {/* CV Content Container - Print optimized */}
                                        <div className="w-full h-full p-8" style={{ fontSize: '12pt' }}>
                                            {/* Header Section */}
                                            <div className="text-center mb-6 border-b-2 border-primary pb-4">
                                                {cvData.personalInfo.profilePhoto && (
                                                    <img
                                                        src={cvData.personalInfo.profilePhoto}
                                                        alt="Profile"
                                                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary"
                                                        width="96"
                                                        height="96"
                                                    />
                                                )}
                                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                                    {cvData.personalInfo.fullName || 'TAM ADINIZ'}
                                                </h1>
                                                <h2 className="text-xl text-primary mb-3">
                                                    {cvData.personalInfo.jobTitle || 'İŞ BAŞLIĞINIZ'}
                                                </h2>

                                                {/* Contact Info */}
                                                <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                                                    {cvData.personalInfo.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-4 h-4" />
                                                            <span>{cvData.personalInfo.phone}</span>
                                                        </div>
                                                    )}
                                                    {cvData.personalInfo.email && (
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="w-4 h-4" />
                                                            <span>{cvData.personalInfo.email}</span>
                                                        </div>
                                                    )}
                                                    {cvData.personalInfo.location && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{cvData.personalInfo.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Summary */}
                                            {cvData.personalInfo.summary && (
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold mb-3 text-primary border-b border-primary pb-1">
                                                        Haqqımda
                                                    </h3>
                                                    <p className="text-sm leading-relaxed">{cvData.personalInfo.summary}</p>
                                                </div>
                                            )}

                                            {/* Work Experience */}
                                            {cvData.workExperience.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold mb-3 text-primary border-b border-primary pb-1">
                                                        İş Təcrübəsi
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {cvData.workExperience.map((exp) => (
                                                            <div key={exp.id} className="border-l-4 border-primary pl-4">
                                                                <h4 className="font-semibold text-lg">{exp.jobTitle}</h4>
                                                                <p className="text-primary font-medium">{exp.company}</p>
                                                                <p className="text-sm text-gray-500 mb-2">{exp.startYear} - {exp.endYear}</p>
                                                                {exp.description && (
                                                                    <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Education */}
                                            {cvData.education.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold mb-3 text-primary border-b border-primary pb-1">
                                                        Təhsil
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {cvData.education.map((edu) => (
                                                            <div key={edu.id} className="border-l-4 border-primary pl-4">
                                                                <h4 className="font-semibold text-lg">{edu.degree}</h4>
                                                                <p className="text-primary font-medium">{edu.institution}</p>
                                                                <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Skills */}
                                            {cvData.skills.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold mb-3 text-primary border-b border-primary pb-1">
                                                        Bacarıqlar
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {cvData.skills.map((skill, index) => (
                                                            <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Certifications */}
                                            {cvData.certifications.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold mb-3 text-primary border-b border-primary pb-1">
                                                        Sertifikatlar
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {cvData.certifications.map((cert, index) => (
                                                            <span key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-lg text-sm">
                                                                {cert}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Languages */}
                                            {cvData.languages.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold mb-3 text-primary border-b border-primary pb-1">
                                                        Dillər
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {cvData.languages.map((language, index) => (
                                                            <span key={index} className="bg-accent text-accent-foreground px-3 py-1 rounded-lg text-sm">
                                                                {language}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Social Links */}
                                            {cvData.socialLinks.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold mb-3 text-primary border-b border-primary pb-1">
                                                        Sosial Şəbəkələr
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {cvData.socialLinks.map((link, index) => (
                                                            <div key={index} className="text-sm">
                                                                <strong>{link.platform}:</strong> {link.url}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hobbies */}
                                            {cvData.hobbies.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold mb-3 text-primary border-b border-primary pb-1">
                                                        Hobbilər və Maraqlar
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {cvData.hobbies.map((hobby, index) => (
                                                            <span key={index} className="bg-muted text-muted-foreground px-3 py-1 rounded-lg text-sm">
                                                                {hobby}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
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

export default CVBuilderClient;
