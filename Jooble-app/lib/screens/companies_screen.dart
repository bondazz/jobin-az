import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/company.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/verify_badge_widget.dart';
import '../widgets/company_logo_widget.dart';
import '../widgets/shimmer_job_card_skeleton.dart';
import 'company_profile_modal.dart';

class CompaniesScreen extends StatefulWidget {
  const CompaniesScreen({Key? key}) : super(key: key);

  @override
  State<CompaniesScreen> createState() => _CompaniesScreenState();
}

class _CompaniesScreenState extends State<CompaniesScreen> {
  final SupabaseService _service = SupabaseService();
  final TextEditingController _controller = TextEditingController();

  List<Company> _companies = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCompanies();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _loadCompanies() async {
    setState(() {
      _isLoading = true;
    });
    final list = await _service.fetchCompanies(queryStr: _controller.text);
    if (mounted) {
      setState(() {
        _companies = list;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Şirkətlər'),
      ),
      body: Column(
        children: [
          // Search Input
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Container(
              decoration: BoxDecoration(
                color: isDark ? AppTheme.cardDark : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: TextField(
                controller: _controller,
                onSubmitted: (_) => _loadCompanies(),
                style: const TextStyle(fontSize: 14),
                decoration: const InputDecoration(
                  hintText: 'Şirkət axtarın...',
                  prefixIcon: Icon(LucideIcons.search, size: 18),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? ListView.builder(
                    itemCount: 10,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemBuilder: (_, __) => const ShimmerJobCardSkeleton(),
                  )
                : _companies.isEmpty
                    ? Center(
                        child: Text(
                          'Şirkət tapılmadı',
                          style: TextStyle(
                            color: isDark ? Colors.white54 : Colors.black45,
                          ),
                        ),
                      )
                    : RefreshIndicator(
                        color: AppTheme.primaryOrange,
                        onRefresh: _loadCompanies,
                        child: ListView.builder(
                          cacheExtent: 1200.0,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          itemCount: _companies.length,
                          itemBuilder: (context, index) {
                            final company = _companies[index];
                            return RepaintBoundary(
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                decoration: BoxDecoration(
                                  color: isDark ? AppTheme.cardDark : Colors.white,
                                  borderRadius: BorderRadius.circular(12),
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
                                  borderRadius: BorderRadius.circular(12),
                                  child: InkWell(
                                    borderRadius: BorderRadius.circular(12),
                                    onTap: () {
                                      CompanyProfileModal.show(context, company);
                                    },
                                    child: Padding(
                                      padding: const EdgeInsets.all(12.0),
                                      child: Row(
                                        children: [
                                          // Left: Company Logo Avatar
                                          CompanyLogoWidget(
                                            logoUrl: company.logo,
                                            companyName: company.name,
                                            size: 44,
                                            borderRadius: 8,
                                          ),
                                          const SizedBox(width: 12),

                                          // Center: Company Name & Location
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  children: [
                                                    Flexible(
                                                      child: Text(
                                                        company.name,
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                        style: TextStyle(
                                                          fontWeight: FontWeight.bold,
                                                          fontSize: 15,
                                                          color: isDark
                                                              ? AppTheme.textPrimaryDark
                                                              : AppTheme.textPrimaryLight,
                                                        ),
                                                      ),
                                                    ),
                                                    if (company.isVerified) ...[
                                                      const SizedBox(width: 4),
                                                      const VerifyBadgeWidget(size: 15),
                                                    ],
                                                  ],
                                                ),
                                                const SizedBox(height: 4),
                                                Row(
                                                  children: [
                                                    const Icon(
                                                      LucideIcons.mapPin,
                                                      size: 12,
                                                      color: AppTheme.textSecondaryLight,
                                                    ),
                                                    const SizedBox(width: 4),
                                                    Expanded(
                                                      child: Text(
                                                        company.address != null &&
                                                                company.address!.isNotEmpty
                                                            ? company.address!
                                                            : 'Bakı',
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                        style: const TextStyle(
                                                          fontSize: 12,
                                                          color: AppTheme.textSecondaryLight,
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),

                                          const SizedBox(width: 8),

                                          // Right: Job Count Orange Pill Badge
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 10, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFFFF3ED),
                                              borderRadius: BorderRadius.circular(16),
                                              border: Border.all(
                                                color: const Color(0xFFFFD8C2),
                                              ),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                const Icon(
                                                  LucideIcons.briefcase,
                                                  size: 13,
                                                  color: AppTheme.primaryOrange,
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  '${company.jobCount}',
                                                  style: const TextStyle(
                                                    fontSize: 12,
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
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
