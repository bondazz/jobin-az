import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/app_theme.dart';

class AboutScreen extends StatefulWidget {
  const AboutScreen({Key? key}) : super(key: key);

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Jooble Haqqında'),
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
                  const Text(
                    'Jooble Haqqında',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryOrange,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "Azərbaycan'ın ən böyük iş elanları vakansiyalar platforması. Minlərlə iş elanları və yüzlərlə şirkət bir yerdə.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.5,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 3 Stat Cards Row
            Row(
              children: [
                _buildStatCard('581', 'Online İstifadəçi', LucideIcons.users, isDark),
                const SizedBox(width: 8),
                _buildStatCard('6,059', 'Aktiv Vakansiya', LucideIcons.briefcase, isDark),
                const SizedBox(width: 8),
                _buildStatCard('9,664', 'Şirkət Sayı', LucideIcons.building, isDark),
              ],
            ),

            const SizedBox(height: 16),

            // Bizim Missiyamız Card
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
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Text(
                    'Bizim Missiyamız',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Jooble olaraq, Azərbaycan'da iş axtaranlar və işəgötürənlər arasında körpü qurmaq, keyfiyyətli iş imkanları yaratmaq və karyera inkişafına dəstək olmaq məqsədindəyik. Platformamız vasitəsilə minlərlə insanın arzuladığı işə qovuşmasına kömək edirik.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.6,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Divider(height: 1),
                  const SizedBox(height: 14),
                  Text(
                    'Platformamız Azərbaycanda iş axtarışı prosesini sadələşdirmək və iş elanları ilə namizədlər arasında körpü yaratmaq məqsədi ilə fəaliyyət göstərir. Minlərlə vakansiya, yüzlərlə şirkət profili və müxtəlif sahələrdə iş imkanları təqdim edirik.\n\nPlatformamızda IT, maliyyə, satış, marketinq, mühəndislik və digər peşə sahələrində vakansiyalar tapa bilərsiniz. Kateqoriyalar səhifəmizdə müxtəlif sahələr üzrə iş elanlarını nəzərdən keçirə, şirkətlər bölməsində aparıcı işəgötürənlərlə tanış ola və qiymətləndirmə səhifəmizdə premium xüsusiyyətlərimiz haqqında məlumat əldə edə bilərsiniz.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.6,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Nə Təklif Edirik Heading
            const Text(
              'Nə Təklif Edirik',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            // 6 Feature Cards Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.15,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: [
                _buildFeatureCard(
                  icon: LucideIcons.briefcase,
                  title: 'İş Elanları və Vakansiyalar',
                  desc: 'Minlərlə aktiv iş elanı və vakansiya arasından sizə uyğun olanı tapın və müraciət edin.',
                  isDark: isDark,
                ),
                _buildFeatureCard(
                  icon: LucideIcons.building,
                  title: 'Şirkət Profilləri',
                  desc: 'Yüzlərlə şirkət profili ilə tanış olun və işəgötürənlər haqqında ətraflı məlumat əldə edin.',
                  isDark: isDark,
                ),
                _buildFeatureCard(
                  icon: LucideIcons.tag,
                  title: 'Kateqoriya üzrə Axtarış',
                  desc: 'Müxtəlif iş sahələri və kateqoriyalar üzrə axtarış edin və uyğun vakansiyaları tapın.',
                  isDark: isDark,
                ),
                _buildFeatureCard(
                  icon: LucideIcons.users,
                  title: 'Referal Sistemi',
                  desc: 'Platformamızı paylaşın, referal linkləri ilə qazanc əldə edin və passiv gəlir əldə edin.',
                  isDark: isDark,
                ),
                _buildFeatureCard(
                  icon: LucideIcons.fileText,
                  title: 'Birbaşa Elan Müraciəti',
                  desc: 'Sayt üzərindən birbaşa iş elanı göndərin, şirkətinizin vakansiyalarını dərc etdirin.',
                  isDark: isDark,
                ),
                _buildFeatureCard(
                  icon: LucideIcons.zap,
                  title: 'Premium Xüsusiyyətlər',
                  desc: 'Premium üzvlük ilə əlavə imkanlardan yararlanın və iş axtarışınızı daha effektiv edin.',
                  isDark: isDark,
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Bizimlə Əlaqə Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFFFF3ED),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: AppTheme.primaryOrange.withValues(alpha: 0.4),
                ),
              ),
              child: Column(
                children: [
                  const Text(
                    'Bizimlə Əlaqə',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Suallarınızı, təkliflərinizi və ya iş təkliflərinizi bizə göndərin. Komandamız sizinlə əlaqə saxlamaqdan məmnun olacaq.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppTheme.textSecondaryDark : AppTheme.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildContactPill('info@jooble.az', LucideIcons.mail, isDark),
                      _buildContactPill('+994 55 341 10 11', LucideIcons.phone, isDark),
                      _buildContactPill('Bakı, Azərbaycan', LucideIcons.mapPin, isDark),
                    ],
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

  Widget _buildStatCard(String val, String label, IconData icon, bool isDark) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.cardDark : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppTheme.primaryOrange.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 18, color: AppTheme.primaryOrange),
            ),
            const SizedBox(height: 8),
            Text(
              val,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 10,
                color: AppTheme.textSecondaryLight,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCard({
    required IconData icon,
    required String title,
    required String desc,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
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
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppTheme.primaryOrange.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: AppTheme.primaryOrange),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: Text(
              desc,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
                height: 1.3,
                color: AppTheme.textSecondaryLight,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactPill(String text, IconData icon, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.primaryOrange.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppTheme.primaryOrange),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
