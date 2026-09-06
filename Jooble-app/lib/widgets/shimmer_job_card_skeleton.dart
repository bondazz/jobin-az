import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ShimmerJobCardSkeleton extends StatefulWidget {
  const ShimmerJobCardSkeleton({Key? key}) : super(key: key);

  @override
  State<ShimmerJobCardSkeleton> createState() => _ShimmerJobCardSkeletonState();
}

class _ShimmerJobCardSkeletonState extends State<ShimmerJobCardSkeleton>
    with SingleTickerProviderStateMixin {
  late AnimationController _anim;

  @override
  void initState() {
    super.initState();
    _anim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnimatedBuilder(
      animation: _anim,
      builder: (context, _) {
        final shimmerGradient = LinearGradient(
          colors: isDark
              ? [
                  const Color(0xFF1E293B),
                  const Color(0xFF334155),
                  const Color(0xFF1E293B),
                ]
              : [
                  const Color(0xFFE2E8F0),
                  const Color(0xFFF1F5F9),
                  const Color(0xFFE2E8F0),
                ],
          stops: const [0.0, 0.5, 1.0],
          begin: Alignment(-1.0 + (_anim.value * 3.0), -0.3),
          end: Alignment(1.0 + (_anim.value * 3.0), 0.3),
        );

        return Container(
          margin: const EdgeInsets.only(bottom: 10, left: 16, right: 16),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.cardDark : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
            ),
          ),
          child: Row(
            children: [
              // Skeleton Logo Avatar
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: shimmerGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Skeleton Job Title
                    Container(
                      width: double.infinity,
                      height: 14,
                      decoration: BoxDecoration(
                        gradient: shimmerGradient,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Skeleton Company Subtitle
                    Container(
                      width: 130,
                      height: 10,
                      decoration: BoxDecoration(
                        gradient: shimmerGradient,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Skeleton Attributes Row
                    Row(
                      children: [
                        Container(
                          width: 60,
                          height: 10,
                          decoration: BoxDecoration(
                            gradient: shimmerGradient,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          width: 70,
                          height: 10,
                          decoration: BoxDecoration(
                            gradient: shimmerGradient,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
