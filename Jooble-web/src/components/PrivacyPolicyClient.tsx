"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MobileHeader from '@/components/MobileHeader';
import SEOBreadcrumb from '@/components/SEOBreadcrumb';
import { useI18n } from '@/components/I18nProvider';
import {
    Shield, Lock, Eye, UserCheck, Server, Mail, FileText,
    AlertTriangle, CreditCard, Scale, Clock, Globe, Cookie,
    RefreshCw, Phone, Ban, Gavel, Info
} from 'lucide-react';

const PrivacyPolicyClient = () => {
    const { t, getLocalizedPath } = useI18n();

    const privacySections = [
        {
            icon: Info,
            title: 'Ümumi Məlumat',
            content: 'jooble.az – iş elanlarının yayımını həyata keçirən onlayn platformadır (bundan sonra "Platforma" və ya "Jooble"). İş elanları Azərbaycan Respublikasında dövlət qeydiyyatına alınmış vergi ödəyicilərindən (bundan sonra yerindən asılı olaraq İşəgötürən, Müraciətçi və ya Sifarişçi) onların əməkdaşları və ya nümayəndələri vasitəsilə qəbul olunur və son istifadəçilərə (bundan sonra İşaxtaran) jooble.az veb-saytı və Platformanın sosial media səhifələri və kanalları üzərindən təqdim edilir.',
        },
        {
            icon: Eye,
            title: '1. Məxfilik Siyasəti',
            content: 'Bu məxfilik siyasəti, jooble.az veb-saytında şəxsi məlumatların toplanması, saxlanması və istifadəsi prosedurlarını izah edir. jooble.az veb-saytına daxil olaraq və ondan istifadə edərək, bu məxfilik siyasətində göstərilən şəkildə şəxsi məlumatlarınızın toplanmasına, istifadə olunmasına və açıqlanmasına razı olduğunuzu bildirirsiniz.\n\njooble.az veb-saytında şəxsi məlumatların toplanması, saxlanması və istifadəsi Azərbaycan Respublikası qanunvericiliyinə uyğun olaraq həyata keçirilir.',
        },
    ];

    const subSections = [
        {
            icon: FileText,
            title: '1.1 Topladığımız Məlumatlar',
            intro: 'Topladığımız məlumatlar, xidmətlərimizi etibarlı və effektiv şəkildə təqdim etmək üçün vacibdir:',
            items: [
                { label: 'İxtiyarla Verilən Məlumatlar', text: 'Xidmət və məhsullarımıza maraq göstərərkən könüllü olaraq təqdim etdiyiniz şəxsi məlumatları (ad, soyad, e-poçt, telefon nömrəsi, CV məlumatları) toplayırıq.' },
                { label: 'Onlayn Fəaliyyətlər', text: 'jooble.az veb-saytında fəaliyyət göstərərkən və ya bizimlə müxtəlif səbəblərdən əlaqə qurarkən brauzer, cihaz və istifadə məlumatları toplanır.' },
                { label: 'Kontekstual Asılılıq', text: 'Toplanan məlumatlar, bizimlə əlaqə qurma tərzinizə, etdiyiniz seçimlərə və jooble.az-ın istifadə etdiyiniz xüsusi məhsul və funksiyalarına əsaslanır.' },
            ],
        },
        {
            icon: UserCheck,
            title: '1.2 Məlumatlarınızı Necə İstifadə Edirik',
            intro: 'Topladığımız məlumatlardan istifadə, sizinlə əlaqə saxladığınız xidmətlərə və bizimlə paylaşdığınız seçimlərə əsaslanır:',
            items: [
                { label: 'Xidmətlərin təqdim edilməsi', text: 'İş elanlarının göstərilməsi, müraciətlərin idarə edilməsi və istifadəçi hesabının idarə olunması.' },
                { label: 'Araşdırma və inkişaf', text: 'Platformanın təkmilləşdirilməsi və yeni xüsusiyyətlərin yaradılması üçün.' },
                { label: 'Ünsiyyət', text: 'Xidmətlər barədə sizinlə əlaqə saxlamaq, bildirişlər göndərmək.' },
                { label: 'Dəstək', text: 'Sorğularınızı cavablandırmaq və şikayətlərinizi həll etmək.' },
            ],
        },
        {
            icon: Globe,
            title: '1.3 Məlumatlarınızın Paylaşılması',
            intro: '',
            items: [
                { label: '', text: 'Qanun tələblərini nəzərə alaraq, şəxsi məlumatlarınızı bağlı şirkətlərlə, bizim adımıza xidmət göstərən təchizatçılarla, tərəfdaşlarla, inkişaf etdiricilərlə və ya sizin göstərişinizlə digər şəxslərlə paylaşa bilərik. Şəxsi məlumatlarınız heç bir halda üçüncü tərəflərə satılmır.' },
            ],
        },
        {
            icon: Cookie,
            title: '1.4 Çərəzlər və Bənzər Texnologiyalar',
            intro: '',
            items: [
                { label: '', text: '"Çərəzlər" (cookies) və bənzər texnologiyalar istifadə edərək məlumat toplama və saxlamağa baş vura bilərik. Bu texnologiyalar istifadəçi davranışını daha yaxşı anlamağa, təhlükəsizlik və fırıldaqçılıqla mübarizə aparmağa kömək edir. Həmçinin, istifadəçilərin saytımızın hansı hissələrinə baxdığını və axtarışların effektivliyini qiymətləndirməyə imkan verir. Brauzer parametrlərinizdən çərəzləri idarə edə bilərsiniz.' },
            ],
        },
        {
            icon: Server,
            title: '1.5 Üçüncü Tərəf Vebsaytları',
            intro: '',
            items: [
                { label: '', text: 'jooble.az veb-saytından digər vebsaytlara, onlayn xidmətlərə və mobil tətbiqlərə keçidlər ola bilər. Bu üçüncü tərəflərə təqdim etdiyiniz məlumatların təhlükəsizliyi və məxfiliyi barədə zəmanət verə bilmirik. Onlara təqdim etdiyiniz şəxsi məlumatlar bu məxfilik siyasətinə daxil edilmir.' },
            ],
        },
        {
            icon: Lock,
            title: '1.6 Məlumatların Qorunması',
            intro: '',
            items: [
                { label: '', text: 'Jooble olaraq, şəxsi məlumatlarınızı təşkilati, texnoloji və fiziki müdafiə tədbirləri ilə (SSL/TLS şifrələmə, təhlükəsiz serverlər) qorumağa sadiqik. Biz müdafiə tədbirlərini davamlı olaraq inkişaf etdirir və təkmilləşdiririk. Məqsədimiz şəxsi məlumatlarınızın qorunmasını təmin etməkdir.' },
            ],
        },
        {
            icon: Clock,
            title: '1.7 Məlumatların Saxlanması',
            intro: '',
            items: [
                { label: '', text: 'Topladığımız məlumatların saxlanma müddəti, məlumatın növünə və xüsusi ehtiyaclarımıza əsaslanır. Şəxsi məlumatlarınızı yalnız bu məxfilik siyasətində göstərilən məqsədləri yerinə yetirmək üçün lazım olan müddət ərzində saxlayırıq. Hesabınızı silmək istədikdə bütün şəxsi məlumatlarınız sistemdən silinəcək.' },
            ],
        },
        {
            icon: RefreshCw,
            title: '1.8 Bu Siyasətin Yenilənməsi',
            intro: '',
            items: [
                { label: '', text: 'Biz bu məxfilik siyasətini zaman-zaman yeniləyə bilərik. Yenilənmiş versiya, "Son yenilənmə" tarixini göstərərək təqdim ediləcəkdir.' },
            ],
        },
    ];

    const serviceSections = [
        {
            icon: FileText,
            title: '2.1 Təqdim Edilən Məlumatların Doğruluğu və Zəmanət',
            intro: 'İşəgötürən (Şirkət və ya fərdi sahibkar), İşəgötürənin əməkdaşı və ya onun nümayəndəsi iş elanının jooble.az saytında dərc edilməsi üçün təqdim etdiyi məlumatların düzgün, tam və aktual olduğuna zəmanət verir:',
            items: [
                'Müraciətdə şirkət (qurum) haqqında göstərilən məlumatların doğru olduğunu təsdiq edirəm və səhv məlumat nəticəsində yarana biləcək zərərlərə görə məsuliyyət daşıdığımı bəyan edirəm.',
                'Vakansiya elanı müraciətdə qeyd edilən Şirkətə və ya fərdi sahibkara məxsusdur.',
                'Vakansiya elanında qeyd olunan məlumatların həqiqiliyini təsdiq edirəm.',
                'Vakansiya elanı üzrə hər bir müraciətə baxılacağını, tələblərə uyğun qiymətləndiriləcəyini və müraciətçilərə cavab veriləcəyini bəyan edirəm.',
                'İşaxtaran ilə yazışmalar, telefon danışığı və görüş zamanı etika qaydalarına əməl edəcəyimizə, nəzakətli davranacağımıza və əlavə ödəniş tələb etməyəcəyimizi bəyan edirəm.',
            ],
        },
        {
            icon: CreditCard,
            title: '2.2 Xidmətlər və Ödənişlər',
            intro: '',
            items: [
                'Xidmətlərin qiymətləri Azərbaycan valyutasında (AZN) göstərilir. Qiymətlər bazar şərtlərinə uyğun olaraq dəyişə bilər.',
                'Bütün ödənişlər rəsmi ödəniş üsulları ilə qəbul edilir.',
                'Müraciətçinin təqdim etdiyi məlumatlar Jooble-un tələblərinə uyğun olduqda Platforma tərəfindən yayım xidməti göstərilir.',
                'Əgər müraciətçi və onun iş elanı barədə məlumatlar saxta, qeyri-dəqiq və ya yarımçıq olarsa, iş elanının dərcindən imtina olunur və bu barədə müraciətçiyə məlumat verilir.',
                'Jooble iş elanlarının izləyicilərinə göstərilməsini təmin edir, lakin vakansiya üzrə müraciətlərin olacağına zəmanət vermir. Müraciət olmadığı halda xidmət haqqı geri qaytarılmır.',
            ],
        },
        {
            icon: Clock,
            title: '2.3 İş Elanının Paylaşılma Müddəti',
            intro: '',
            items: [
                'Yoxlanış, sənədləşmə və ödəniş mərhələləri başa çatdıqdan sonra iş elanı 24 saat ərzində paylaşılır.',
            ],
        },
        {
            icon: AlertTriangle,
            title: '2.4 İş Elanına Müraciətin Olub-Olmayacağı',
            intro: '',
            items: [
                'Jooble yalnız iş elanlarının yayımlanması və paylaşılması ilə məşğul olur. Dərc edilən iş elanı üzrə müraciətin olub-olmayacağına zəmanət verilmir.',
            ],
        },
        {
            icon: Shield,
            title: '2.5 Jooble-un İş Elanı Üzrə Məsuliyyəti',
            intro: '',
            items: [
                'Jooble iş elanlarının məzmununa, həmçinin işəgötürən və işaxtaran arasında telefon, onlayn və görüş zamanı danışıqlara, işəgötürənin əməkdaşlarının və işaxtaranların hərəkətlərinə görə məsuliyyət daşımır.',
                'İşaxtaran namizəd işə qəbul olmaq üçün heç bir ödəniş və ya bu məqsədlə kart məlumatlarını təqdim etməməlidir.',
            ],
        },
        {
            icon: Phone,
            title: '2.6 Müraciət Zamanı Yaranan Çətinliklər',
            intro: '',
            items: [
                'Hər hansı problem zamanı istifadəçi info@jooble.az ünvanına və ya əlaqə nömrəsinə müraciət edə bilər.',
            ],
        },
        {
            icon: Server,
            title: '2.7 Texniki Xidmətlər və Əlaqə',
            intro: '',
            items: [
                'Platforma 7/24 aktivdir. Lakin planlı texniki işlər zamanı qısa müddətli fasilələr ola bilər.',
                'Müştəri dəstəyi həftənin bazar ertəsi – cümə günləri saat 10:00 – 17:00 müddətində aktivdir.',
                'Əlaqə: info@jooble.az',
            ],
        },
        {
            icon: Ban,
            title: '2.8 Qadağan Olunmuş Fəaliyyətlər',
            intro: '',
            items: [
                'Onlayn müraciət zamanı yalan məlumatlar təqdim etmək, platformaya qarşı zərərli hərəkətlər (DDoS, hack cəhdləri və s.) etmək qadağandır.',
            ],
        },
        {
            icon: RefreshCw,
            title: '2.9 Şərtlərin Dəyişdirilməsi',
            intro: '',
            items: [
                'Jooble istənilən vaxt Məxfilik siyasəti və Xidmət şərtlərini dəyişmək hüququnu özündə saxlayır. Yenilənmiş şərtlər platformada paylaşılır və istifadəçinin davam edən istifadəsi yeni şərtlərin qəbul edilməsi kimi qəbul olunur.',
            ],
        },
        {
            icon: Gavel,
            title: '2.10 Qanunvericilik və Məhkəmə Yurisdiksiyası',
            intro: '',
            items: [
                'Bu şərtlər Azərbaycan Respublikasının qanunvericiliyi ilə tənzimlənir. Mübahisəli hallar müvafiq məhkəmələrdə həll olunur.',
            ],
        },
        {
            icon: CreditCard,
            title: '2.11 Kartdan İstifadə Məsuliyyəti',
            intro: '',
            items: [
                'Saytımızdan istifadə edərək ödəniş edən hər bir şəxs, ödənişi həyata keçirdiyi bank kartının sahibi olduğunu və ya kart sahibinin tam icazəsi ilə bu əməliyyatı etdiyini təsdiqləmiş sayılır.',
                '3D Secure təhlükəsizlik tədbirləri ilə təsdiqlənmiş hər bir əməliyyat hüquqi baxımdan təsdiqlənmiş və geri qaytarılması mümkün olmayan əməliyyat hesab olunur.',
                'Əgər ödəniş yetkinlik yaşına çatmamış şəxs tərəfindən kart sahibinin xəbəri olmadan həyata keçirilibsə, bu halda məsuliyyət müştərinin üzərində qalır. Jooble.az bu cür hallarda geri ödəniş və ya xidmətin ləğvini təmin etmir.',
                'İşəgötürənlərə tövsiyə olunur ki, kart və cihaz məlumatlarına nəzarət etsinlər. Jooble.az yalnız təsdiqlənmiş əməliyyatlar üzrə texniki dəstəyi həyata keçirir, hüquqi və maliyyə məsuliyyət daşımır.',
            ],
        },
    ];

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-background to-primary/5">
            <SEOBreadcrumb
                items={[
                    { label: 'Məxfilik Siyasəti və Xidmət Şərtləri' }
                ]}
                visuallyHidden={true}
            />

            <MobileHeader />

            <div className="p-4 sm:p-8 pt-20 xl:pt-8 pb-24 xl:pb-8">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                            Məxfilik Siyasəti və Xidmət Şərtləri
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Xahiş edirik jooble.az saytından istifadə etməzdən əvvəl aşağıdakı Məxfilik siyasəti və Xidmət şərtlərini diqqətlə oxuyun. Siz bu Platformaya daxil olmaqla və ya ondan istifadə etməklə, bu şərtləri qəbul etdiyinizi bəyan etmiş olursunuz.
                    </p>
                </div>

                {/* Last Updated */}
                <div className="text-center mb-8">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                        <Clock className="w-4 h-4" />
                        Son yenilənmə: Fevral 2026
                    </span>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* General Info + Privacy Intro */}
                    {privacySections.map((section, index) => (
                        <Card
                            key={`privacy-${index}`}
                            className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                        <section.icon className="w-5 h-5 text-white" />
                                    </div>
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Privacy Sub-sections */}
                    {subSections.map((section, index) => (
                        <Card
                            key={`sub-${index}`}
                            className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in ml-0 sm:ml-4"
                            style={{ animationDelay: `${(index + 2) * 80}ms` }}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="w-9 h-9 bg-primary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <section.icon className="w-4.5 h-4.5 text-primary" />
                                    </div>
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {section.intro && (
                                    <p className="text-muted-foreground leading-relaxed">{section.intro}</p>
                                )}
                                <ul className="space-y-2.5">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-muted-foreground leading-relaxed">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                                            <span>
                                                {item.label && <strong className="text-foreground">{item.label}: </strong>}
                                                {item.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Service Terms Header */}
                    <Card className="border-border/50 shadow-card bg-primary/5 animate-fade-in">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Scale className="w-5 h-5 text-white" />
                                </div>
                                2. Xidmət Şərtləri
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    {/* Service Sub-sections */}
                    {serviceSections.map((section, index) => (
                        <Card
                            key={`service-${index}`}
                            className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in ml-0 sm:ml-4"
                            style={{ animationDelay: `${(index) * 60}ms` }}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="w-9 h-9 bg-primary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <section.icon className="w-4.5 h-4.5 text-primary" />
                                    </div>
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {section.intro && (
                                    <p className="text-muted-foreground leading-relaxed">{section.intro}</p>
                                )}
                                <ul className="space-y-2.5">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-muted-foreground leading-relaxed">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Footer Note */}
                    <Card className="border-border/50 shadow-card bg-primary/5 mt-10">
                        <CardContent className="p-6">
                            <p className="text-sm text-muted-foreground leading-relaxed text-center">
                                Bu Məxfilik siyasəti və Xidmət şərtləri Jooble.az platforması tərəfindən hazırlanmışdır. Siyasətdə dəyişikliklər edildiyi halda bu səhifədə yenilənəcək. Platformamızdan istifadə etməklə siz bu şərtləri qəbul etmiş olursunuz.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyClient;
