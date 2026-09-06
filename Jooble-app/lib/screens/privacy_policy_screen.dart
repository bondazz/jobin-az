import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/app_theme.dart';

class PrivacyPolicyScreen extends StatefulWidget {
  const PrivacyPolicyScreen({Key? key}) : super(key: key);

  @override
  State<PrivacyPolicyScreen> createState() => _PrivacyPolicyScreenState();
}

class _PrivacyPolicyScreenState extends State<PrivacyPolicyScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Məxfilik Siyasəti və Şərtlər'),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Header Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.cardDark : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
                ),
              ),
              child: Column(
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(LucideIcons.shieldCheck, size: 26, color: AppTheme.primaryOrange),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Məxfilik Siyasəti və Xidmət Şərtləri',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryOrange,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Xahiş edirik jooble.az saytından istifadə etməzdən əvvəl aşağıdakı Məxfilik siyasəti və Xidmət şərtlərini diqqətlə oxuyun. Siz bu Platformaya daxil olmaqla və ya ondan istifadə etməklə, bu şərtləri qəbul etdiyinizi bəyan etmiş olursunuz.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.5,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryOrange.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.primaryOrange.withValues(alpha: 0.3)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.clock, size: 12, color: AppTheme.primaryOrange),
                        SizedBox(width: 6),
                        Text(
                          'Son yenilənmə: Fevral 2026',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryOrange,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Ümumi Məlumat
            _buildSectionCard(
              icon: LucideIcons.info,
              title: 'Ümumi Məlumat',
              child: Text(
                'jooble.az – iş elanlarının yayımını həyata keçirən onlayn platformadır (bundan sonra "Platforma" və ya "Jooble"). İş elanları Azərbaycan Respublikasında dövlət qeydiyyatına alınmış vergi ödəyicilərindən (bundan sonra yerindən asılı olaraq İşəgötürən, Müraciətçi və ya Sifarişçi) onların əməkdaşları və ya nümayəndələri vasitəsilə qəbul olunur və son istifadəçilərə (bundan sonra İşaxtaran) jooble.az veb-saytı və Platformanın sosial media səhifələri və kanalları üzərindən təqdim edilir.',
                style: TextStyle(
                  fontSize: 13,
                  height: 1.6,
                  color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
                ),
              ),
              isDark: isDark,
            ),

            const SizedBox(height: 16),

            // Section 1 Header
            _buildMainCategoryHeader('1. Məxfilik Siyasəti', LucideIcons.eye, isDark),
            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.eye,
              title: '1. Məxfilik Siyasəti haqqında',
              child: Text(
                'Bu məxfilik siyasəti, jooble.az veb-saytında şəxsi məlumatların toplanması, saxlanması və istifadəsi prosedurlarını izah edir. jooble.az veb-saytına daxil olaraq və ondan istifadə edərək, bu məxfilik siyasətində gösterilən şəkildə şəxsi məlumatlarınızın toplanmasına, istifadə olunmasına və açıqlanmasına razı olduğunuzu bildirirsiniz.\n\njooble.az veb-saytında şəxsi məlumatların toplanması, saxlanması və istifadəsi Azərbaycan Respublikası qanunvericiliyinə uyğun olaraq həyata keçirilir.',
                style: TextStyle(
                  fontSize: 13,
                  height: 1.6,
                  color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
                ),
              ),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.fileText,
              title: '1.1 Topladığımız Məlumatlar',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Topladığımız məlumatlar, xidmətlərimizi etibarlı və effektiv şəkildə təqdim etmək üçün vacibdir:',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.5,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _buildBulletPoint('İxtiyarla Verilən Məlumatlar: Xidmət və məhsullarımıza maraq göstərərkən könüllü olaraq təqdim etdiyiniz şəxsi məlumatları (ad, soyad, e-poçt, telefon nömrəsi, CV məlumatları) toplayırıq.', isDark),
                  _buildBulletPoint('Onlayn Fəaliyyətlər: jooble.az veb-saytında fəaliyyət göstərərkən və ya bizimlə müxtəlif səbəblərdən əlaqə qurarkən brauzer, cihaz və istifadə məlumatları toplanır.', isDark),
                  _buildBulletPoint('Kontekstual Asılılıq: Toplanan məlumatlar, bizimlə əlaqə qurma tərzinizə, etdiyiniz seçimlərə və jooble.az-ın istifadə etdiyiniz xüsusi məhsul və funksiyalarına əsaslanır.', isDark),
                ],
              ),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.userCheck,
              title: '1.2 Məlumatlarınızı Necə İstifadə Edirik',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Topladığımız məlumatlardan istifadə, sizinlə əlaqə saxladığınız xidmətlərə və bizimlə paylaşdığınız seçimlərə əsaslanır:',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.5,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _buildBulletPoint('Xidmətlərin təqdim edilməsi: İş elanlarının göstərilməsi, müraciətlərin idarə edilməsi və istifadəçi hesabının idarə olunması.', isDark),
                  _buildBulletPoint('Araşdırma və inkişaf: Platformanın təkmilləşdirilməsi və yeni xüsusiyyətlərin yaradılması üçün.', isDark),
                  _buildBulletPoint('Ünsiyyət: Xidmətlər barədə sizinlə əlaqə saxlamaq, bildirişlər göndərmək.', isDark),
                  _buildBulletPoint('Dəstək: Sorğularınızı cavablandırmaq və şikayətlərinizi həll etmək.', isDark),
                ],
              ),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.globe,
              title: '1.3 Məlumatlarınızın Paylaşılması',
              child: _buildBulletPoint('Qanun tələblərini nəzərə alaraq, şəxsi məlumatlarınızı bağlı şirkətlərlə, bizim adımıza xidmət göstərən təchizatçılarla, tərəfdaşlarla, inkişaf etdiricilərlə və ya sizin göstərişinizlə digər şəxslərlə paylaşa bilərik. Şəxsi məlumatlarınız heç bir halda üçüncü tərəflərə satılmır.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.cookie,
              title: '1.4 Çərəzlər və Bənzər Texnologiyalar',
              child: _buildBulletPoint('"Çərəzlər" (cookies) və bənzər texnologiyalar istifadə edərək məlumat toplama və saxlamağa baş vura bilərik. Bu texnologiyalar istifadəçi davranışını daha yaxşı anlamağa, təhlükəsizlik və fırıldaqçılıqla mübarizə aparmağa kömək edir. Həmçinin, istifadəçilərin saytımızın hansı hissələrinə baxdığını və axtarışların effektivliyini qiymətləndirməyə imkan verir. Brauzer parametrlərinizdən çərəzləri idarə edə bilərsiniz.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.server,
              title: '1.5 Üçüncü Tərəf Vebsaytları',
              child: _buildBulletPoint('jooble.az veb-saytından digər vebsaytlara, onlayn xidmətlərə və mobil tətbiqlərə keçidlər ola bilər. Bu üçüncü tərəflərə təqdim etdiyiniz məlumatların təhlükəsizliyi və məxfiliyi barədə zəmanət verə bilmirik. Onlara təqdim etdiyiniz şəxsi məlumatlar bu məxfilik siyasətinə daxil edilmir.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.lock,
              title: '1.6 Məlumatların Qorunması',
              child: _buildBulletPoint('Jooble olaraq, şəxsi məlumatlarınızı təşkilati, texnoloji və fiziki müdafiə tədbirləri ilə (SSL/TLS şifrələmə, təhlükəsiz serverlər) qorumağa sadiqik. Biz müdafiə tədbirlərini davamlı olaraq inkişaf etdirir və təkmilləşdiririk. Məqsədimiz şəxsi məlumatlarınızın qorunmasını təmin etməkdir.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.clock,
              title: '1.7 Məlumatların Saxlanması',
              child: _buildBulletPoint('Topladığımız məlumatların saxlanma müddəti, məlumatın növünə və xüsusi ehtiyaclarımıza əsaslanır. Şəxsi məlumatlarınızı yalnız bu məxfilik siyasətində göstərilən məqsədləri yerinə yetirmək üçün lazım olan müddət ərzində saxlayırıq. Hesabınızı silmək istədikdə bütün şəxsi məlumatlarınız sistemdən silinəcək.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.refreshCw,
              title: '1.8 Bu Siyasətin Yenilənməsi',
              child: _buildBulletPoint('Biz bu məxfilik siyasətini zaman-zaman yeniləyə bilərik. Yenilənmiş versiya, "Son yenilənmə" tarixini göstərərək təqdim ediləcəkdir.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 20),

            // Section 2 Header
            _buildMainCategoryHeader('2. Xidmət Şərtləri', LucideIcons.scale, isDark),
            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.fileText,
              title: '2.1 Təqdim Edilən Məlumatların Doğruluğu və Zəmanət',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'İşəgötürən (Şirkət və ya fərdi sahibkar), İşəgötürənin əməkdaşı və ya onun nümayəndəsi iş elanının jooble.az saytında dərc edilməsi üçün təqdim etdiyi məlumatların düzgün, tam və aktual olduğuna zəmanət verir:',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.5,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _buildBulletPoint('Müraciətdə şirkət (qurum) haqqında göstərilən məlumatların doğru olduğunu təsdiq edirəm və səhv məlumat nəticəsində yarana biləcək zərərlərə görə məsuliyyət daşıdığımı bəyan edirəm.', isDark),
                  _buildBulletPoint('Vakansiya elanı müraciətdə qeyd edilən Şirkətə və ya fərdi sahibkara məxsusdur.', isDark),
                  _buildBulletPoint('Vakansiya elanında qeyd olunan məlumatların həqiqiliyini təsdiq edirəm.', isDark),
                  _buildBulletPoint('Vakansiya elanı üzrə hər bir müraciətə baxılacağını, tələblərə uyğun qiymətləndiriləcəyini və müraciətçilərə cavab veriləcəyini bəyan edirəm.', isDark),
                  _buildBulletPoint('İşaxtaran ilə yazışmalar, telefon danışığı və görüş zamanı etika qaydalarına əməl edəcəyimizə, nəzakətli davranacağımıza və əlavə ödəniş tələb etməyəcəyimizi bəyan edirəm.', isDark),
                ],
              ),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.creditCard,
              title: '2.2 Xidmətlər və Ödənişlər',
              child: Column(
                children: [
                  _buildBulletPoint('Xidmətlərin qiymətləri Azərbaycan valyutasında (AZN) göstərilir. Qiymətlər bazar şərtlərinə uyğun olaraq dəyişə bilər.', isDark),
                  _buildBulletPoint('Bütün ödənişlər rəsmi ödəniş üsulları ilə qəbul edilir.', isDark),
                  _buildBulletPoint('Müraciətçinin təqdim etdiyi məlumatlar Jooble-un tələblərinə uyğun olduqda Platforma tərəfindən yayım xidməti göstərilir.', isDark),
                  _buildBulletPoint('Əgər müraciətçi və onun iş elanı barədə məlumatlar saxta, qeyri-dəqiq və ya yarımçıq olarsa, iş elanının dərcindən imtina olunur və bu barədə müraciətçiyə məlumat verilir.', isDark),
                  _buildBulletPoint('Jooble iş elanlarının izləyicilərinə göstərilməsini təmin edir, lakin vakansiya üzrə müraciətlərin olacağına zəmanət vermir. Müraciət olmadığı halda xidmət haqqı geri qaytarılmır.', isDark),
                ],
              ),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.clock,
              title: '2.3 İş Elanının Paylaşılma Müddəti',
              child: _buildBulletPoint('Yoxlanış, sənədləşmə və ödəniş mərhələləri başa çatdıqdan sonra iş elanı 24 saat ərzində paylaşılır.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.alertTriangle,
              title: '2.4 İş Elanına Müraciətin Olub-Olmayacağı',
              child: _buildBulletPoint('Jooble yalnız iş elanlarının yayımlanması və paylaşılması ilə məşğul olur. Dərc edilən iş elanı üzrə müraciətin olub-olmayacağına zəmanət verilmir.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.shield,
              title: '2.5 Jooble-un İş Elanı Üzrə Məsuliyyəti',
              child: Column(
                children: [
                  _buildBulletPoint('Jooble iş elanlarının məzmununa, həmçinin işəgötürən və işaxtaran arasında telefon, onlayn və görüş zamanı danışıqlara, işəgötürənin əməkdaşlarının və işaxtaranların hərəkətlərinə görə məsuliyyət daşımır.', isDark),
                  _buildBulletPoint('İşaxtaran namizəd işə qəbul olmaq üçün heç bir ödəniş və ya bu məqsədlə kart məlumatlarını təqdim etməməlidir.', isDark),
                ],
              ),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.phone,
              title: '2.6 Müraciət Zamanı Yaranan Çətinliklər',
              child: _buildBulletPoint('Hər hansı problem zamanı istifadəçi info@jooble.az ünvanına və ya əlaqə nömrəsinə müraciət edə bilər.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.server,
              title: '2.7 Texniki Xidmətlər və Əlaqə',
              child: Column(
                children: [
                  _buildBulletPoint('Platforma 7/24 aktivdir. Lakin planlı texniki işlər zamanı qısa müddətli fasilələr ola bilər.', isDark),
                  _buildBulletPoint('Müştəri dəstəyi həftənin bazar ertəsi – cümə günləri saat 10:00 – 17:00 müddətində aktivdir.', isDark),
                  _buildBulletPoint('Əlaqə: info@jooble.az', isDark),
                ],
              ),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.ban,
              title: '2.8 Qadağan Olunmuş Fəaliyyətlər',
              child: _buildBulletPoint('Onlayn müraciət zamanı yalan məlumatlar təqdim etmək, platformaya qarşı zərərli hərəkətlər (DDoS, hack cəhdləri və s.) etmək qadağandır.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.refreshCw,
              title: '2.9 Şərtlərin Dəyişdirilməsi',
              child: _buildBulletPoint('Jooble istənilən vaxt Məxfilik siyasəti və Xidmət şərtlərini dəyişmək hüququnu özündə saxlayır. Yenilənmiş şərtlər platformada paylaşılır və istifadəçinin davam edən istifadəsi yeni şərtlərin qəbul edilməsi kimi qəbul olunur.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.scale,
              title: '2.10 Qanunvericilik və Məhkəmə Yurisdiksiyası',
              child: _buildBulletPoint('Bu şərtlər Azərbaycan Respublikasının qanunvericiliyi ilə tənzimlənir. Mübahisəli hallar müvafiq məhkəmələrdə həll olunur.', isDark),
              isDark: isDark,
            ),

            const SizedBox(height: 10),

            _buildSectionCard(
              icon: LucideIcons.creditCard,
              title: '2.11 Kartdan İstifadə Məsuliyyəti',
              child: Column(
                children: [
                  _buildBulletPoint('Saytımızdan istifadə edərək ödəniş edən hər bir şəxs, ödənişi həyata keçirdiyi bank kartının sahibi olduğunu və ya kart sahibinin tam icazəsi ilə bu əməliyyatı etdiyini təsdiqləmiş sayılır.', isDark),
                  _buildBulletPoint('3D Secure təhlükəsizlik tədbirləri ilə təsdiqlənmiş hər bir əməliyyat hüquqi baxımdan təsdiqlənmiş və geri qaytarılması mümkün olmayan əməliyyat hesab olunur.', isDark),
                  _buildBulletPoint('Əgər ödəniş yetkinlik yaşına çatmamış şəxs tərəfindən kart sahibinin xəbəri olmadan həyata keçirilibsə, bu halda məsuliyyət müştərinin üzərində qalır. Jooble.az bu cür hallarda geri ödəniş və ya xidmətin ləğvini təmin etmir.', isDark),
                  _buildBulletPoint('İşəgötürənlərə tövsiyə olunur ki, kart və cihaz məlumatlarına nəzarət etsinlər. Jooble.az yalnız təsdiqlənmiş əməliyyatlar üzrə texniki dəstəyi həyata keçirir, hüquqi və maliyyə məsuliyyət daşımır.', isDark),
                ],
              ),
              isDark: isDark,
            ),

            const SizedBox(height: 20),

            // Bottom Footer Notice Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFFFF3ED),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.primaryOrange.withValues(alpha: 0.3)),
              ),
              child: Text(
                'Bu Məxfilik siyasəti və Xidmət şərtləri Jooble.az platforması tərəfindən hazırlanmışdır. Siyasətdə dəyişikliklər edildiyi halda bu səhifədə yenilənəcək. Platformamızdan istifadə etməklə siz bu şərtləri qəbul etmiş olursunuz.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  height: 1.5,
                  color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                ),
              ),
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildMainCategoryHeader(String title, IconData icon, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.primaryOrange,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.white),
          const SizedBox(width: 10),
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required IconData icon,
    required String title,
    required Widget child,
    required bool isDark,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardDark : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppTheme.primaryOrange.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 16, color: AppTheme.primaryOrange),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildBulletPoint(String text, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '• ',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryOrange,
            ),
          ),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 13,
                height: 1.5,
                color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
