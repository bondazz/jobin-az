import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/app_theme.dart';
import '../services/theme_service.dart';

class DrawerMenuModal extends StatelessWidget {
  final VoidCallback onOpenAddJob;
  final Function(int pageIndex) onSelectPage;

  const DrawerMenuModal({
    Key? key,
    required this.onOpenAddJob,
    required this.onSelectPage,
  }) : super(key: key);

  static void show(
    BuildContext context, {
    required VoidCallback onOpenAddJob,
    required Function(int pageIndex) onSelectPage,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      transitionAnimationController: AnimationController(
        vsync: Navigator.of(context),
        duration: const Duration(milliseconds: 400),
      ),
      builder: (_) => DrawerMenuModal(
        onOpenAddJob: onOpenAddJob,
        onSelectPage: onSelectPage,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.78,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardDark : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag Handle
          const SizedBox(height: 10),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : Colors.black26,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),

          // Title & Close Button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Naviqasiya',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(LucideIcons.x, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Menu List Items
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ƏSAS BÖLMƏLƏR',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textSecondaryLight,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 8),

                  _buildMenuItem(
                    context,
                    icon: LucideIcons.plusCircle,
                    label: 'Elan yerləşdir',
                    badge: 'Yeni',
                    iconColor: AppTheme.primaryOrange,
                    onTap: () {
                      Navigator.pop(context);
                      onOpenAddJob();
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: LucideIcons.rss,
                    label: 'Abunə ol',
                    onTap: () {
                      Navigator.pop(context);
                      onSelectPage(4); // Index 4: SubscribeScreen
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: LucideIcons.bookOpen,
                    label: 'Bloq',
                    onTap: () {
                      Navigator.pop(context);
                      onSelectPage(5); // Index 5: BlogScreen
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: LucideIcons.dollarSign,
                    label: 'Xidmətlər və Qiymətlər',
                    onTap: () {
                      Navigator.pop(context);
                      onSelectPage(6); // Index 6: ServicesPricingScreen
                    },
                  ),
                  _buildMenuItem(
                    context,
                    icon: LucideIcons.info,
                    label: 'Haqqımızda',
                    onTap: () {
                      Navigator.pop(context);
                      onSelectPage(7); // Index 7: AboutScreen
                    },
                  ),

                  const SizedBox(height: 16),
                  const Divider(height: 1),
                  const SizedBox(height: 12),

                  const Text(
                    'TƏNZİMLƏMƏLƏR VƏ ŞƏRTLƏR',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textSecondaryLight,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Məxfilik Siyasəti
                  _buildMenuItem(
                    context,
                    icon: LucideIcons.lock,
                    label: 'Məxfilik Siyasəti',
                    onTap: () {
                      Navigator.pop(context);
                      onSelectPage(8); // Index 8: PrivacyPolicyScreen
                    },
                  ),

                  // Dynamic Theme Toggle Button (Replaces Sitemap XML!)
                  ValueListenableBuilder<ThemeMode>(
                    valueListenable: ThemeService.themeModeNotifier,
                    builder: (context, currentMode, _) {
                      final isCurrentDark = currentMode == ThemeMode.dark;
                      return _buildMenuItem(
                        context,
                        icon: isCurrentDark ? LucideIcons.sun : LucideIcons.moon,
                        label: isCurrentDark ? 'Gündüz Rejimi' : 'Gəcə Rejimi',
                        iconColor: isCurrentDark ? Colors.amber : Colors.indigo,
                        onTap: () {
                          ThemeService.toggleTheme();
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    String? badge,
    Color? iconColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
        ),
      ),
      child: ListTile(
        onTap: onTap,
        dense: true,
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: (iconColor ?? AppTheme.primaryOrange).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            size: 18,
            color: iconColor ?? AppTheme.primaryOrange,
          ),
        ),
        title: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
          ),
        ),
        trailing: badge != null
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.primaryOrange,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  badge,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              )
            : const Icon(LucideIcons.chevronRight, size: 16),
      ),
    );
  }
}
