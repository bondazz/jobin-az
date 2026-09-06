import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../models/job.dart';
import '../theme/app_theme.dart';
import '../screens/job_detail_screen.dart';
import 'verify_badge_widget.dart';
import 'company_logo_widget.dart';

class SimilarJobCard extends StatelessWidget {
  final Job job;

  const SimilarJobCard({Key? key, required this.job}) : super(key: key);

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diffDays = now.difference(dt).inDays;
    if (diffDays <= 0) return 'Bu gün';
    if (diffDays == 1) return 'Dünən';
    if (diffDays <= 7) return '$diffDays gün əvvəl';
    try {
      return DateFormat('dd.MM.yyyy').format(dt);
    } catch (_) {
      return 'Bu gün';
    }
  }

  bool get _isVerified {
    return job.company?['is_verified'] == true;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardDark : Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.02),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () {
            Navigator.push(
              context,
              PageRouteBuilder(
                pageBuilder: (_, __, ___) => JobDetailScreen(job: job),
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
          },
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Top Row: Logo + Title & Company
                Row(
                  children: [
                    // Logo Avatar
                    Hero(
                      tag: 'similar_job_logo_${job.id}',
                      child: CompanyLogoWidget(
                        logoUrl: job.companyLogo,
                        companyName: job.companyName,
                        size: 32,
                        borderRadius: 6,
                      ),
                    ),
                    const SizedBox(width: 6),

                    // Title & Company Name
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            job.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isDark
                                  ? AppTheme.textPrimaryDark
                                  : AppTheme.textPrimaryLight,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  job.companyName,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isDark
                                        ? AppTheme.textSecondaryDark
                                        : AppTheme.textSecondaryLight,
                                  ),
                                ),
                              ),
                              if (_isVerified) ...[
                                const SizedBox(width: 2),
                                const VerifyBadgeWidget(size: 10),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                // Middle Row: Location & Views
                Row(
                  children: [
                    const Icon(LucideIcons.mapPin,
                        size: 10, color: AppTheme.primaryOrange),
                    const SizedBox(width: 2),
                    Text(
                      job.location,
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppTheme.textSecondaryLight,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(LucideIcons.eye,
                        size: 10, color: AppTheme.primaryOrange),
                    const SizedBox(width: 2),
                    Text(
                      '${job.views}',
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppTheme.textSecondaryLight,
                      ),
                    ),
                  ],
                ),

                const Divider(height: 1),

                // Bottom Row: Salary & Date
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      job.salary != null && job.salary!.isNotEmpty
                          ? '${job.salary} AZN'
                          : 'Maaş göstərilməyib',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: job.salary != null && job.salary!.isNotEmpty
                            ? FontWeight.bold
                            : FontWeight.normal,
                        color: job.salary != null && job.salary!.isNotEmpty
                            ? AppTheme.primaryOrange
                            : AppTheme.textSecondaryLight,
                      ),
                    ),
                    Text(
                      _formatDate(job.createdAt),
                      style: TextStyle(
                        fontSize: 10,
                        color: isDark ? Colors.white54 : Colors.black45,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInitialLogo() {
    final firstChar = job.companyName.isNotEmpty
        ? job.companyName[0].toUpperCase()
        : 'J';
    return Center(
      child: Text(
        firstChar,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: AppTheme.primaryOrange,
        ),
      ),
    );
  }
}
