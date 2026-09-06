import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/company.dart';
import '../models/job.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/job_card.dart';
import '../widgets/verify_badge_widget.dart';
import '../widgets/company_logo_widget.dart';
import '../widgets/shimmer_job_card_skeleton.dart';

class CompanyProfileModal extends StatefulWidget {
  final Company company;

  const CompanyProfileModal({Key? key, required this.company}) : super(key: key);

  static void show(BuildContext context, Company company) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      transitionAnimationController: AnimationController(
        vsync: Navigator.of(context),
        duration: const Duration(milliseconds: 400),
      ),
      builder: (_) => CompanyProfileModal(company: company),
    );
  }

  @override
  State<CompanyProfileModal> createState() => _CompanyProfileModalState();
}

class _CompanyProfileModalState extends State<CompanyProfileModal> {
  final SupabaseService _service = SupabaseService();
  String _activeTab = 'about'; // 'about' or 'jobs'
  List<Job> _companyJobs = [];
  bool _isLoadingJobs = false;

  @override
  void initState() {
    super.initState();
    _loadCompanyJobs();
  }

  Future<void> _loadCompanyJobs() async {
    setState(() {
      _isLoadingJobs = true;
    });

    List<Job> jobs = await _service.fetchJobsByCompany(widget.company.id);

    if (jobs.isEmpty) {
      final allJobs = await _service.fetchJobs(limit: 100);
      jobs = allJobs
          .where((j) =>
              j.companyId == widget.company.id ||
              j.companyName.trim().toLowerCase() ==
                  widget.company.name.trim().toLowerCase())
          .toList();
    }

    if (mounted) {
      setState(() {
        _companyJobs = jobs;
        _isLoadingJobs = false;
      });
    }
  }

  Future<void> _launchWebsite(String urlStr) async {
    if (urlStr.isEmpty) return;
    String cleanUrl = urlStr.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://$cleanUrl';
    }
    final Uri uri = Uri.parse(cleanUrl);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri, mode: LaunchMode.externalNonBrowserApplication);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Veb sayt açıla bilmədi: $cleanUrl')),
        );
      }
    }
  }

  Future<void> _copyEmail(String emailStr) async {
    final cleanEmail = emailStr.trim();
    await Clipboard.setData(ClipboardData(text: cleanEmail));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('E-mail nüsxələndi: $cleanEmail'),
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hasBackground = widget.company.backgroundImage != null &&
        widget.company.backgroundImage!.isNotEmpty;

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardDark : AppTheme.lightBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle & close button row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.cardDark : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 40),
                Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : Colors.black26,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                IconButton(
                  icon: const Icon(LucideIcons.x, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          // Scrollable Body
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Company Cover Background Image & Floating Logo
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      // Cover Banner (background_image column)
                      Container(
                        height: 140,
                        width: double.infinity,
                        color: isDark
                            ? const Color(0xFF1E293B)
                            : const Color(0xFFFFF3ED),
                        child: hasBackground
                            ? CachedNetworkImage(
                                imageUrl: widget.company.backgroundImage!,
                                width: double.infinity,
                                height: 140,
                                fit: BoxFit.cover,
                                errorWidget: (_, __, ___) => _buildCoverFallback(),
                              )
                            : _buildCoverFallback(),
                      ),

                      // Floating Logo Avatar with SVG & Uri encoding support
                      Positioned(
                        left: 20,
                        bottom: -30,
                        child: Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isDark ? AppTheme.cardDark : Colors.white,
                              width: 4,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.15),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: CompanyLogoWidget(
                            logoUrl: widget.company.logo,
                            companyName: widget.company.name,
                            size: 72,
                            borderRadius: 36,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 40),

                  // Company Title & Info Card
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                widget.company.name,
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            if (widget.company.isVerified) ...[
                              const SizedBox(width: 6),
                              const VerifyBadgeWidget(size: 20),
                            ],
                          ],
                        ),

                        const SizedBox(height: 12),

                        // Ünvan (Address), Veb Sayt, E-mail Card
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDark ? AppTheme.cardDark : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Ünvan row
                              Row(
                                children: [
                                  const Icon(LucideIcons.mapPin,
                                      size: 16, color: AppTheme.primaryOrange),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'Ünvan: ',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Expanded(
                                    child: Text(
                                      widget.company.address != null &&
                                              widget.company.address!.isNotEmpty
                                          ? widget.company.address!
                                          : 'Bakı, Azərbaycan',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: AppTheme.textSecondaryLight,
                                      ),
                                    ),
                                  ),
                                ],
                              ),

                              // Veb Sayt row (opens external browser!)
                              if (widget.company.website != null &&
                                  widget.company.website!.isNotEmpty) ...[
                                const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 8),
                                  child: Divider(height: 1),
                                ),
                                InkWell(
                                  onTap: () =>
                                      _launchWebsite(widget.company.website!),
                                  child: Row(
                                    children: [
                                      const Icon(LucideIcons.globe,
                                          size: 16, color: AppTheme.primaryOrange),
                                      const SizedBox(width: 8),
                                      const Text(
                                        'Veb Sayt: ',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Expanded(
                                        child: Text(
                                          widget.company.website!,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            color: AppTheme.primaryOrange,
                                            decoration: TextDecoration.none,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],

                              // Email row (copies email on tap!)
                              if (widget.company.email != null &&
                                  widget.company.email!.isNotEmpty) ...[
                                const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 8),
                                  child: Divider(height: 1),
                                ),
                                InkWell(
                                  onTap: () =>
                                      _copyEmail(widget.company.email!),
                                  child: Row(
                                    children: [
                                      const Icon(LucideIcons.mail,
                                          size: 16, color: AppTheme.primaryOrange),
                                      const SizedBox(width: 8),
                                      const Text(
                                        'E-mail: ',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Expanded(
                                        child: Text(
                                          widget.company.email!,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            color: AppTheme.primaryOrange,
                                            decoration: TextDecoration.none,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      const Icon(LucideIcons.copy,
                                          size: 13, color: AppTheme.primaryOrange),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Tab Controls (Şirkət Haqqında | İş Elanları)
                        Row(
                          children: [
                            Expanded(
                              child: InkWell(
                                onTap: () =>
                                    setState(() => _activeTab = 'about'),
                                child: Container(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 12),
                                  decoration: BoxDecoration(
                                    color: _activeTab == 'about'
                                        ? AppTheme.primaryOrange
                                        : (isDark
                                            ? AppTheme.cardDark
                                            : Colors.white),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: _activeTab == 'about'
                                          ? AppTheme.primaryOrange
                                          : (isDark
                                              ? AppTheme.borderDark
                                              : AppTheme.borderLight),
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      'Şirkət Haqqında',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: _activeTab == 'about'
                                            ? Colors.white
                                            : (isDark
                                                ? Colors.white70
                                                : Colors.black87),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: InkWell(
                                onTap: () =>
                                    setState(() => _activeTab = 'jobs'),
                                child: Container(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 12),
                                  decoration: BoxDecoration(
                                    color: _activeTab == 'jobs'
                                        ? AppTheme.primaryOrange
                                        : (isDark
                                            ? AppTheme.cardDark
                                            : Colors.white),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: _activeTab == 'jobs'
                                          ? AppTheme.primaryOrange
                                          : (isDark
                                              ? AppTheme.borderDark
                                              : AppTheme.borderLight),
                                    ),
                                  ),
                                  child: Center(
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          LucideIcons.briefcase,
                                          size: 16,
                                          color: _activeTab == 'jobs'
                                              ? Colors.white
                                              : (isDark
                                                  ? Colors.white70
                                                  : Colors.black87),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'İş Elanları (${_companyJobs.length})',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                            color: _activeTab == 'jobs'
                                                ? Colors.white
                                                : (isDark
                                                    ? Colors.white70
                                                    : Colors.black87),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Tab Content: Render HTML Description formatted nicely without raw codes
                        _activeTab == 'about'
                            ? Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color:
                                      isDark ? AppTheme.cardDark : Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isDark
                                        ? AppTheme.borderDark
                                        : AppTheme.borderLight,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Məlumat',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    _buildHtmlContent(
                                      (widget.company.description != null &&
                                              widget.company.description!.isNotEmpty)
                                          ? widget.company.description!
                                          : '${widget.company.name} Azərbaycanın aparıcı şirkətlərindən biridir.',
                                      isDark,
                                    ),
                                  ],
                                ),
                              )
                            : _isLoadingJobs
                                ? Column(
                                    children: List.generate(
                                        5, (_) => const ShimmerJobCardSkeleton()),
                                  )
                                : _companyJobs.isEmpty
                                    ? const Center(
                                        child: Padding(
                                          padding: EdgeInsets.all(24.0),
                                          child: Text(
                                            'Bu şirkət üçün aktiv iş elanı tapılmadı',
                                            style: TextStyle(
                                              fontSize: 14,
                                              color: AppTheme.textSecondaryLight,
                                            ),
                                          ),
                                        ),
                                      )
                                    : Column(
                                        children: _companyJobs
                                            .map((j) => JobCard(job: j))
                                            .toList(),
                                      ),

                        const SizedBox(height: 30),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHtmlContent(String htmlText, bool isDark) {
    if (htmlText.trim().isEmpty) return const SizedBox();

    String cleanHtml = htmlText
        .replaceAll(RegExp(r'&nbsp;'), ' ')
        .replaceAll(RegExp(r'</p>|<br\s*/?>|</li>'), '\n')
        .replaceAll(RegExp(r'<p[^>]*>|<ul[^>]*>|</ul>|<ol[^>]*>|</ol>'), '');

    List<String> rawLines = cleanHtml.split('\n');
    List<Widget> children = [];

    for (var line in rawLines) {
      String trimmed = line.trim();
      if (trimmed.isEmpty) continue;

      bool isBullet = trimmed.startsWith('•') ||
          trimmed.startsWith('-') ||
          trimmed.startsWith('*');
      String textContent = trimmed
          .replaceAll(RegExp(r'^[•\-\*]\s*'), '')
          .replaceAll(RegExp(r'<[^>]*>'), '');

      if (textContent.trim().isEmpty) continue;

      bool isHeader = textContent.endsWith(':') ||
          textContent.startsWith('Haqqımızda') ||
          textContent.startsWith('Missiyamız') ||
          textContent.startsWith('Fəaliyyət');

      if (isHeader) {
        children.add(
          Padding(
            padding: const EdgeInsets.only(top: 12, bottom: 6),
            child: Text(
              textContent,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color:
                    isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
              ),
            ),
          ),
        );
      } else if (isBullet) {
        children.add(
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '• ',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryOrange,
                  ),
                ),
                Expanded(
                  child: SelectableText(
                    textContent,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.5,
                      color: isDark
                          ? AppTheme.textPrimaryDark
                          : AppTheme.textPrimaryLight,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      } else {
        children.add(
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: SelectableText(
              textContent,
              style: TextStyle(
                fontSize: 14,
                height: 1.6,
                color: isDark
                    ? AppTheme.textPrimaryDark
                    : AppTheme.textPrimaryLight,
              ),
            ),
          ),
        );
      }
    }

    if (children.isEmpty) {
      return SelectableText(
        htmlText.replaceAll(RegExp(r'<[^>]*>|&nbsp;'), ' '),
        style: TextStyle(
          fontSize: 14,
          height: 1.6,
          color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: children,
    );
  }

  Widget _buildCoverFallback() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFE05328), Color(0xFFD97706)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Icon(
          LucideIcons.building2,
          size: 48,
          color: Colors.white.withValues(alpha: 0.3),
        ),
      ),
    );
  }
}
