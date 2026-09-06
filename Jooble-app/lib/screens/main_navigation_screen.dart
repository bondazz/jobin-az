import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/favorites_service.dart';
import '../services/supabase_service.dart';
import '../services/theme_service.dart';
import '../theme/app_theme.dart';
import '../widgets/add_job_modal.dart';
import 'home_screen.dart';
import 'categories_screen.dart';
import 'companies_screen.dart';
import 'favorites_screen.dart';
import 'subscribe_screen.dart';
import 'blog_screen.dart';
import 'services_pricing_screen.dart';
import 'about_screen.dart';
import 'privacy_policy_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({Key? key}) : super(key: key);

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  final SupabaseService _service = SupabaseService();
  int _currentIndex = 0;
  late AnimationController _drawerController;
  late Animation<double> _drawerAnimation;

  int _dailyJobCount = 0;
  int _monthlyJobCount = 0;
  bool _isLoadingStats = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    FavoritesService.init();

    _drawerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );

    _drawerAnimation = CurvedAnimation(
      parent: _drawerController,
      curve: Curves.fastOutSlowIn,
    );

    _loadStatistics();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      if (_drawerController.isAnimating) {
        _drawerController.stop();
      }
    }
  }

  Future<void> _loadStatistics() async {
    final daily = await _service.fetchDailyJobsCount();
    final monthly = await _service.fetchMonthlyJobsCount();
    if (mounted) {
      setState(() {
        _dailyJobCount = daily;
        _monthlyJobCount = monthly;
        _isLoadingStats = false;
      });
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _drawerController.dispose();
    super.dispose();
  }

  bool get _isDrawerOpen =>
      _drawerController.status == AnimationStatus.completed ||
      _drawerController.status == AnimationStatus.forward;

  void _toggleDrawer() {
    if (_isDrawerOpen) {
      _drawerController.reverse();
    } else {
      _drawerController.forward();
    }
  }

  void _closeDrawer() {
    if (_isDrawerOpen) {
      _drawerController.reverse();
    }
  }

  void _openAddJobModal() {
    _closeDrawer();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AddJobModal(),
    );
  }

  void _selectTab(int index) {
    _closeDrawer();
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenSize = MediaQuery.of(context).size;

    // Status bar clock/battery icons visibility fix + Pure White bottom notch bar
    final SystemUiOverlayStyle overlayStyle = SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
      systemNavigationBarDividerColor: Colors.white,
    );

    final List<Widget> pages = [
      HomeScreen(onOpenAddJob: _openAddJobModal),
      const CategoriesScreen(),
      const CompaniesScreen(),
      const FavoritesScreen(),
      const SubscribeScreen(),
      const BlogScreen(),
      const ServicesPricingScreen(),
      const AboutScreen(),
      const PrivacyPolicyScreen(),
    ];

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: overlayStyle,
      child: PopScope(
        canPop: !_isDrawerOpen,
        onPopInvokedWithResult: (didPop, result) {
          if (_isDrawerOpen) {
            _closeDrawer();
          }
        },
        child: Scaffold(
          backgroundColor: const Color(0xFF0F172A),
          body: Stack(
            children: [
              _buildBackgroundDrawerMenu(isDark, screenSize),
              AnimatedBuilder(
                animation: _drawerAnimation,
                child: Scaffold(
                  body: IndexedStack(
                    index: _currentIndex,
                    children: pages,
                  ),
                  bottomNavigationBar: Container(
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.cardDark : Colors.white,
                      border: Border(
                        top: BorderSide(
                          color: isDark
                              ? AppTheme.borderDark
                              : AppTheme.borderLight,
                          width: 1,
                        ),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, -2),
                        ),
                      ],
                    ),
                    child: SafeArea(
                      bottom: true,
                      child: SizedBox(
                        height: 60,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildNavItem(
                              icon: LucideIcons.briefcase,
                              label: 'Vakansiyalar',
                              index: 0,
                              isDark: isDark,
                            ),
                            _buildNavItem(
                              icon: LucideIcons.tag,
                              label: 'Kateqoriyalar',
                              index: 1,
                              isDark: isDark,
                            ),
                            _buildNavItem(
                              icon: LucideIcons.building,
                              label: 'Şirkətlər',
                              index: 2,
                              isDark: isDark,
                            ),
                            ValueListenableBuilder<int>(
                              valueListenable: FavoritesService.favoriteCountNotifier,
                              builder: (context, savedCount, _) {
                                return _buildNavItem(
                                  icon: LucideIcons.bookmark,
                                  label: 'Saxlanılan işlər',
                                  index: 3,
                                  isDark: isDark,
                                  badgeCount: savedCount,
                                );
                              },
                            ),
                            _buildCustomButton(
                              icon: LucideIcons.menu,
                              label: 'Menyu',
                              isDark: isDark,
                              onTap: _toggleDrawer,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                builder: (context, childWidget) {
                  final animVal = _drawerAnimation.value;
                  if (animVal == 0.0) {
                    return childWidget!;
                  }

                  final scale = 1.0 - (animVal * 0.18);
                  final translateX = animVal * -(screenSize.width * 0.64);
                  final translateY = animVal * (screenSize.height * 0.05);
                  final rotateY = animVal * 0.28;
                  final rotateZ = animVal * 0.045;

                  final matrix = Matrix4.identity()
                    ..setEntry(3, 2, 0.001)
                    ..translate(translateX, translateY, 0.0)
                    ..scale(scale, scale, 1.0)
                    ..rotateY(rotateY)
                    ..rotateZ(rotateZ);

                  return Transform(
                    transform: matrix,
                    alignment: Alignment.centerRight,
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(animVal * 28.0),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.85),
                          width: animVal * 3.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.50),
                            blurRadius: 36,
                            spreadRadius: 4,
                            offset: const Offset(14, 14),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(animVal * 24.0),
                        child: Stack(
                          children: [
                            childWidget!,
                            if (_isDrawerOpen)
                              Positioned.fill(
                                child: GestureDetector(
                                  onTap: _closeDrawer,
                                  onHorizontalDragUpdate: (details) {
                                    if (details.primaryDelta != null &&
                                        details.primaryDelta! > 5) {
                                      _closeDrawer();
                                    }
                                  },
                                  behavior: HitTestBehavior.opaque,
                                  child: Container(
                                    color: Colors.black.withValues(alpha: 0.08 * animVal),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBackgroundDrawerMenu(bool isDark, Size screenSize) {
    final menuLeftPadding = screenSize.width * 0.38;

    return Stack(
      children: [
        Container(
          width: double.infinity,
          height: double.infinity,
          color: const Color(0xFF0F172A),
          padding: EdgeInsets.only(left: menuLeftPadding, top: 48, bottom: 20, right: 14),
          child: SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Image.asset(
                      'assets/images/logo.png',
                      height: 32,
                      color: Colors.white,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Text(
                        'Jooble.',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'NAVİQASİYA',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF94A3B8),
                            letterSpacing: 1.1,
                          ),
                        ),
                        const SizedBox(height: 10),

                        _buildDrawerTile(
                          icon: LucideIcons.plusCircle,
                          title: 'Elan yerləşdir',
                          badge: 'Yeni',
                          accentColor: AppTheme.primaryOrange,
                          onTap: _openAddJobModal,
                        ),
                        _buildDrawerTile(
                          icon: LucideIcons.rss,
                          title: 'Abunə ol',
                          onTap: () => _selectTab(4),
                        ),
                        _buildDrawerTile(
                          icon: LucideIcons.bookOpen,
                          title: 'Bloq',
                          onTap: () => _selectTab(5),
                        ),
                        _buildDrawerTile(
                          icon: LucideIcons.dollarSign,
                          title: 'Xidmətlər',
                          onTap: () => _selectTab(6),
                        ),
                        _buildDrawerTile(
                          icon: LucideIcons.info,
                          title: 'Haqqımızda',
                          onTap: () => _selectTab(7),
                        ),
                        _buildDrawerTile(
                          icon: LucideIcons.lock,
                          title: 'Məxfilik Siyasəti',
                          onTap: () => _selectTab(8),
                        ),

                        const SizedBox(height: 12),
                        const Divider(color: Color(0xFF334155), height: 1),
                        const SizedBox(height: 12),

                        ValueListenableBuilder<ThemeMode>(
                          valueListenable: ThemeService.themeModeNotifier,
                          builder: (context, currentMode, _) {
                            final isCurrentDark = currentMode == ThemeMode.dark;
                            return _buildCleanThemeSwitcherRow(isCurrentDark);
                          },
                        ),

                        const SizedBox(height: 14),

                        _buildStatisticsCard(),

                        const SizedBox(height: 14),

                        _buildSocialMediaNav(),

                        const SizedBox(height: 50),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                const Row(
                  children: [
                    Icon(
                      LucideIcons.shieldCheck,
                      size: 14,
                      color: Color(0xFF475569),
                    ),
                    SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Jooble - İş elanları və Vakansiyalar',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 11,
                          color: Color(0xFF475569),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        Positioned(
          bottom: -15,
          left: 0,
          right: 0,
          child: IgnorePointer(
            child: Image.asset(
              'assets/images/jooble_background_image.webp',
              height: screenSize.height * 0.40,
              width: screenSize.width,
              fit: BoxFit.contain,
              alignment: Alignment.bottomCenter,
              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCleanThemeSwitcherRow(bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(
                isDark ? LucideIcons.moon : LucideIcons.sun,
                size: 16,
                color: isDark ? Colors.indigoAccent : Colors.amber,
              ),
              const SizedBox(width: 8),
              Text(
                isDark ? 'Gecə Rejimi' : 'Gündüz Rejimi',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          // Custom Sliding Toggle Switch Pill Button
          GestureDetector(
            onTap: () => ThemeService.toggleTheme(),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              width: 46,
              height: 25,
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF312E81) : const Color(0xFFF59E0B),
                borderRadius: BorderRadius.circular(13),
              ),
              child: AnimatedAlign(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
                alignment: isDark ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  width: 21,
                  height: 21,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isDark ? LucideIcons.moon : LucideIcons.sun,
                    size: 12,
                    color: isDark ? const Color(0xFF312E81) : const Color(0xFFD97706),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Supabase Real Statistics Div Card (Günlük: today's start, Aylıq: 1st of month)
  Widget _buildStatisticsCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF1E293B),
            const Color(0xFF0F172A).withValues(alpha: 0.9),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppTheme.primaryOrange.withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(LucideIcons.barChart2, size: 14, color: AppTheme.primaryOrange),
              SizedBox(width: 6),
              Text(
                'STATİSTİKA',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryOrange,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _isLoadingStats
              ? const SizedBox(
                  height: 30,
                  child: Center(
                    child: SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                        color: AppTheme.primaryOrange,
                        strokeWidth: 1.5,
                      ),
                    ),
                  ),
                )
              : Column(
                  children: [
                    _buildStatRow('🔥 Günlük elanlar:', '$_dailyJobCount'),
                    const SizedBox(height: 6),
                    _buildStatRow('📅 Aylıq elanlar:', '$_monthlyJobCount'),
                  ],
                ),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: Color(0xFF94A3B8),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildDrawerTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    String? badge,
    Color? accentColor,
  }) {
    final color = accentColor ?? Colors.white;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B).withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: const Color(0xFF334155),
              ),
            ),
            child: Row(
              children: [
                Icon(icon, size: 16, color: color),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
                if (badge != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryOrange,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      badge,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  )
                else
                  const Icon(LucideIcons.chevronRight,
                      size: 13, color: Color(0xFF64748B)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required int index,
    required bool isDark,
    int badgeCount = 0,
  }) {
    final isSelected = _currentIndex == index;

    return Expanded(
      child: InkWell(
        onTap: () {
          _closeDrawer();
          setState(() {
            _currentIndex = index;
          });
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    icon,
                    size: 20,
                    color: isSelected
                        ? AppTheme.primaryOrange
                        : (isDark
                            ? AppTheme.textSecondaryDark
                            : AppTheme.textSecondaryLight),
                  ),
                  if (badgeCount > 0)
                    Positioned(
                      top: -4,
                      right: -8,
                      child: Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: AppTheme.primaryOrange,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 14,
                          minHeight: 14,
                        ),
                        child: Text(
                          '$badgeCount',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected
                      ? AppTheme.primaryOrange
                      : (isDark
                          ? AppTheme.textSecondaryDark
                          : AppTheme.textSecondaryLight),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCustomButton({
    required IconData icon,
    required String label,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 20,
                color: isDark
                    ? AppTheme.textSecondaryDark
                    : AppTheme.textSecondaryLight,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.normal,
                  color: isDark
                      ? AppTheme.textSecondaryDark
                      : AppTheme.textSecondaryLight,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSocialMediaNav() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // WhatsApp
          _buildSocialIcon(
            icon: LucideIcons.messageCircle,
            color: const Color(0xFF25D366),
            url: 'https://wa.me/994553411011',
          ),
          // Instagram
          _buildSocialIcon(
            icon: LucideIcons.instagram,
            color: const Color(0xFFE1306C),
            url: 'https://instagram.com/jooble.az',
          ),
          // Telegram
          _buildSocialIcon(
            icon: LucideIcons.send,
            color: const Color(0xFF0088CC),
            url: 'https://t.me/joobleaz',
          ),
          // Threads
          _buildSocialIcon(
            icon: LucideIcons.atSign,
            color: Colors.white,
            url: 'https://threads.net/@jooble.az',
          ),
          // Facebook
          _buildSocialIcon(
            icon: LucideIcons.facebook,
            color: const Color(0xFF1877F2),
            url: 'https://www.facebook.com/people/joobleaz/61582558110105',
          ),
        ],
      ),
    );
  }

  Widget _buildSocialIcon({
    required IconData icon,
    required Color color,
    required String url,
  }) {
    return InkWell(
      onTap: () async {
        final Uri uri = Uri.parse(url);
        try {
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          }
        } catch (_) {}
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Center(
          child: Icon(icon, size: 15, color: color),
        ),
      ),
    );
  }
}
