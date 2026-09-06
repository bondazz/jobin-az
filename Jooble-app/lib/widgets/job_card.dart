import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../models/job.dart';
import '../theme/app_theme.dart';
import '../services/favorites_service.dart';
import '../screens/job_detail_screen.dart';
import 'verify_badge_widget.dart';
import 'company_logo_widget.dart';

class JobCard extends StatefulWidget {
  final Job job;
  final VoidCallback? onFavoriteChanged;

  const JobCard({
    Key? key,
    required this.job,
    this.onFavoriteChanged,
  }) : super(key: key);

  @override
  State<JobCard> createState() => _JobCardState();
}

class _JobCardState extends State<JobCard> {
  late int _views;

  @override
  void initState() {
    super.initState();
    _views = widget.job.views;
  }

  @override
  void didUpdateWidget(covariant JobCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.job.views != widget.job.views) {
      setState(() {
        _views = widget.job.views;
      });
    }
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diffDays = now.difference(dt).inDays;
    if (diffDays <= 0) return 'Bu gün';
    if (diffDays == 1) return 'Dünən';
    if (diffDays <= 7) return '$diffDays gün əvvəl';
    try {
      return DateFormat('dd.MM.yyyy').format(dt);
    } catch (_) {
      return '';
    }
  }

  bool get _isVerified {
    return widget.job.company?['is_verified'] == true;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return RepaintBoundary(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.cardDark : AppTheme.cardLight,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () async {
              // Instantly increment local views counter
              setState(() {
                _views = _views + 1;
              });

              final updatedViews = await Navigator.push<int>(
                context,
                PageRouteBuilder(
                  pageBuilder: (_, __, ___) => JobDetailScreen(job: widget.job),
                  transitionDuration: const Duration(milliseconds: 400),
                  reverseTransitionDuration: const Duration(milliseconds: 300),
                  transitionsBuilder: (_, animation, secondaryAnimation, child) {
                    final curve = CurvedAnimation(
                      parent: animation,
                      curve: Curves.fastOutSlowIn,
                    );
                    return SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.0, 0.12),
                        end: Offset.zero,
                      ).animate(curve),
                      child: FadeTransition(
                        opacity: animation,
                        child: ScaleTransition(
                          scale: Tween<double>(begin: 0.96, end: 1.0).animate(curve),
                          child: child,
                        ),
                      ),
                    );
                  },
                ),
              );

              if (updatedViews != null && mounted) {
                setState(() {
                  _views = updatedViews;
                });
              }
            },
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Row(
                children: [
                  // Left: Company Logo Avatar with Hero
                  CompanyLogoWidget(
                    logoUrl: widget.job.companyLogo,
                    companyName: widget.job.companyName,
                    size: 42,
                    borderRadius: 8,
                  ),
                  const SizedBox(width: 10),

                  // Center: Title & Company Name
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.job.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? AppTheme.textPrimaryDark
                                : AppTheme.textPrimaryLight,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                widget.job.companyName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: isDark
                                      ? AppTheme.textSecondaryDark
                                      : AppTheme.textSecondaryLight,
                                ),
                              ),
                            ),
                            if (_isVerified) ...[
                              const SizedBox(width: 4),
                              const VerifyBadgeWidget(size: 14),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 8),

                  // Right Section: Dünən | 👁 80 | ♡
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // 1. Posting Date
                      Text(
                        _formatDate(widget.job.createdAt),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 5),
                        child: Text(
                          '|',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w300,
                            color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
                          ),
                        ),
                      ),
                      // 2. Eye Icon + View Count Number
                      Icon(
                        LucideIcons.eye,
                        size: 14,
                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '$_views',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 5),
                        child: Text(
                          '|',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w300,
                            color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
                          ),
                        ),
                      ),
                      // 3. Heart Icon
                      ValueListenableBuilder<Set<String>>(
                        valueListenable: FavoritesService.favoriteIdsNotifier,
                        builder: (context, favSet, _) {
                          final isSaved = favSet.contains(widget.job.id);
                          return InkWell(
                            onTap: () {
                              FavoritesService.toggleFavorite(widget.job.id);
                              if (widget.onFavoriteChanged != null) {
                                widget.onFavoriteChanged!();
                              }
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.all(2.0),
                              child: Icon(
                                isSaved ? Icons.favorite : Icons.favorite_border,
                                color: isSaved
                                    ? const Color(0xFFEF4444)
                                    : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                                size: 18,
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
