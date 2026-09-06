import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/verify_badge_widget.dart';

class ServicesPricingScreen extends StatefulWidget {
  const ServicesPricingScreen({Key? key}) : super(key: key);

  @override
  State<ServicesPricingScreen> createState() => _ServicesPricingScreenState();
}

class _ServicesPricingScreenState extends State<ServicesPricingScreen> {
  final SupabaseService _service = SupabaseService();
  List<Map<String, dynamic>> _dbPlans = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPricing();
  }

  Future<void> _loadPricing() async {
    try {
      final response = await _service.client
          .from('pricing_plans')
          .select('*')
          .order('display_order', ascending: true);

      if (mounted) {
        setState(() {
          _dbPlans = List<Map<String, dynamic>>.from(response);
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Qiymət Planları və Xidmətlər'),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Main Title Banner
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
                      Icon(LucideIcons.briefcase, size: 24, color: AppTheme.primaryOrange),
                      SizedBox(width: 8),
                      Text(
                        'Qiymət Planları və Xidmətlər',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryOrange,
                        ),
                      ),
                      SizedBox(width: 8),
                      Icon(LucideIcons.trendingUp, size: 24, color: AppTheme.primaryOrange),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Azərbaycanda peşəkar işçi axtarışı üçün ideal platforma. Vakansiyalar yerləşdirin, iş elanlarınızı yayımlayın və ən yaxşı namizədləri sürətlə tapın. Effektiv işəgötürmə həlli ilə vaxt və büdcəyə qənaət edin.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.5,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Plan 1: Bir vakansiya
            _buildPlanCard(
              title: 'Bir vakansiya',
              subtitle: '1 ay müddətində aktiv qalır',
              price: '15 AZN',
              unit: '/ 1 vakansiya',
              isDark: isDark,
            ),

            // Plan 2: 5 və daha çox elan
            _buildPlanCard(
              title: '5 və daha çox elan',
              subtitle: 'Bir gündə 5 və daha çox elan yerləşdirilməsinə 20% endirim tətbiq olunur.',
              price: '10 (5x) AZN',
              unit: '/ 5+ vakansiya',
              isDark: isDark,
            ),

            // Plan 3: Premium (Highlight Card)
            _buildPlanCard(
              title: 'Premium',
              subtitle: 'Premium iş elanı saytda olan digər elanlardan xüsusi dizayn və Premium qeydi ilə fərqlənərək saytın yuxarı hissəsində, ilk onluqda 1 həftə ərzində qalacaq. Elan müddəti 1 aydır.',
              price: '20 AZN',
              unit: '/ 1 vakansiya',
              badge: 'PREMIUM',
              isPremium: true,
              isDark: isDark,
            ),

            // Plan 4: Təsdiq ikonu (Verify Badge)
            _buildPlanCard(
              title: 'Təsdiq ikonu',
              subtitle: 'Şirkət profilinə 1 il müddətində təsdiq ikonunun (Verify Badge) əlavə edilməsi.',
              price: '100 AZN',
              unit: '/ İllik',
              isDark: isDark,
            ),

            const SizedBox(height: 24),

            // Detailed Xidmətlərimiz Haqqında Section
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Xidmətlərimiz Haqqında',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Peşəkar xidmətlərimiz və əməkdaşlıq qaydalarımız haqqında ətraflı məlumat',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(height: 1),
                  const SizedBox(height: 16),

                  // Section 1: İş Elanı Yerləşdirilməsi Qaydaları
                  _buildSectionHeader('İş Elanı Yerləşdirilməsi Qaydaları'),
                  const SizedBox(height: 8),
                  RichText(
                    text: TextSpan(
                      style: TextStyle(
                        fontSize: 13,
                        height: 1.6,
                        color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
                      ),
                      children: const [
                        TextSpan(
                          text: 'İş elanı vermək istəyənlərdən xahiş olunur ki, vakant vəzifə barədə məlumatları Word formatında ',
                        ),
                        TextSpan(
                          text: 'info@jooble.az',
                          style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryOrange),
                        ),
                        TextSpan(
                          text: ' elektron ünvanına göndərsinlər. Elan mətninin daha oxunaqlı və anlaşılan olması üçün komandamız tərəfindən bəzi qrammatik və üslubi düzəlişlər edilə bilər.',
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),
                  const Text(
                    'Əsas Qaydalar:',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),

                  _buildRuleBullet('Əgər işəgötürən əvvəlcədən müəyyən olunmuş beynəlxalq işədüzəltmə normalarına uyğun fəaliyyət göstərmirsə və ya dəfələrlə bu prinsipləri pozubsa, eləcə də qeyri-qanuni fəaliyyət göstərən şirkətlərin elanlarının yerləşdirilməsindən imtina oluna bilər.', isDark),
                  _buildRuleBullet('İşəgötürən istəyə əsasən, şirkət adını elanda gizli saxlaya bilər, lakin bu halda məlumatlar administratora təqdim edilməlidir və məxfi saxlanılacaq.', isDark),
                  _buildRuleBullet('Bitmə tarixi göstərilməyən elanlar sistemdə maksimum 1 ay müddətində aktiv qalacaq. Bu müddət əlavə ödənişlə uzadıla bilər.', isDark),
                  _buildRuleBullet('Elan yerləşdirmək üçün istəyə görə Əlaqə bölməsinə də yazaraq müraciət edə bilərsiniz.', isDark),

                  const SizedBox(height: 16),
                  const Divider(height: 1),
                  const SizedBox(height: 16),

                  // Section 2: Reklam Bannerləri
                  _buildSectionHeader('Reklam Bannerləri'),
                  const SizedBox(height: 8),
                  Text(
                    'Saytımızda reklam yerləşdirmək istəyənlər üçün banner xidmət haqqı, bannerin ölçülərinə və sayt daxilində yerləşəcəyi bölməyə görə dəyişir. Bu barədə daha ətraflı məlumat almaq üçün Əlaqə səhifəsinə müraciət edə bilərsiniz.',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.6,
                      color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
                    ),
                  ),

                  const SizedBox(height: 16),
                  const Divider(height: 1),
                  const SizedBox(height: 16),

                  // Section 3: Ödəniş və Sənədləşmə
                  _buildSectionHeader('Ödəniş və Sənədləşmə'),
                  const SizedBox(height: 8),
                  Text(
                    'Jooble.az rəsmi qeydiyyatdan keçmiş hüquqi şəxsdir və bütün ödənişlər bank köçürməsi ilə qəbul olunur. Xidmətlərimizə görə bütün vergi və rəsmi sənədlər qanunvericiliyə uyğun təqdim edilir.\n\nƏməkdaşlıq rəsmi xidmət müqaviləsi imzalandıqdan sonra başlayır. Yeni müştərilərdən ilkin mərhələdə avans ödənişi tələb oluna bilər. Uzunmüddətli əməkdaşlıqdan sonra ödəniş, göstərilmiş xidmət əsasında həyata keçirilə bilər.',
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.6,
                      color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildPlanCard({
    required String title,
    required String subtitle,
    required String price,
    required String unit,
    String? badge,
    bool isPremium = false,
    required bool isDark,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isPremium
            ? (isDark ? const Color(0xFF1E293B) : const Color(0xFFFFF3ED))
            : (isDark ? AppTheme.cardDark : Colors.white),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isPremium
              ? AppTheme.primaryOrange
              : (isDark ? AppTheme.borderDark : AppTheme.borderLight),
          width: isPremium ? 2 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (badge != null) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryOrange,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        badge,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    price,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryOrange,
                    ),
                  ),
                  Text(
                    unit,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppTheme.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 12,
              height: 1.5,
              color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: const BoxDecoration(
            color: AppTheme.primaryOrange,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildRuleBullet(String text, bool isDark) {
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
                color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
