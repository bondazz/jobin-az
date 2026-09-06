import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import '../models/job.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../services/favorites_service.dart';
import '../widgets/similar_job_card.dart';
import '../widgets/company_logo_widget.dart';

class JobDetailScreen extends StatefulWidget {
  final Job job;

  const JobDetailScreen({Key? key, required this.job}) : super(key: key);

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  final SupabaseService _service = SupabaseService();
  List<Job> _similarJobs = [];
  bool _isLoadingSimilar = false;
  late int _views;

  @override
  void initState() {
    super.initState();
    _views = widget.job.views + 1;
    _incrementViewCount();
    _loadSimilarJobs();
  }

  Future<void> _incrementViewCount() async {
    await _service.incrementJobViews(widget.job.id);
  }

  Future<void> _loadSimilarJobs() async {
    setState(() {
      _isLoadingSimilar = true;
    });

    final all = await _service.fetchJobs(limit: 30);
    final filtered = all.where((j) => j.id != widget.job.id).take(6).toList();

    if (mounted) {
      setState(() {
        _similarJobs = filtered;
        _isLoadingSimilar = false;
      });
    }
  }

  Future<void> _toggleFav() async {
    await FavoritesService.toggleFavorite(widget.job.id);
    final isFav = await FavoritesService.isFavorite(widget.job.id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isFav
                ? 'Seçilmişlərə əlavə olundu'
                : 'Seçilmişlərdən çıxarıldı',
          ),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _applyJob() async {
    // 1. Fetch RPC application_email (get_job_application_email)
    String? rpcEmail = await _service.getJobApplicationEmail(widget.job.id);

    final String? emailToUse = (rpcEmail != null && rpcEmail.trim().isNotEmpty)
        ? rpcEmail.trim()
        : (widget.job.applicationEmail != null && widget.job.applicationEmail!.trim().isNotEmpty)
            ? widget.job.applicationEmail!.trim()
            : widget.job.company?['email'];

    final String? urlToUse = (widget.job.applicationUrl != null && widget.job.applicationUrl!.trim().isNotEmpty)
        ? widget.job.applicationUrl!.trim()
        : widget.job.company?['website'];

    // If BOTH URL and Email exist, present a choice bottom sheet!
    if (urlToUse != null && urlToUse.isNotEmpty && emailToUse != null && emailToUse.isNotEmpty) {
      _showApplyChoiceSheet(urlToUse, emailToUse);
      return;
    }

    // If Email exists
    if (emailToUse != null && emailToUse.isNotEmpty) {
      await _applyByEmail(emailToUse);
      return;
    }

    // If Website URL exists
    if (urlToUse != null && urlToUse.isNotEmpty) {
      await _launchUrlStr(urlToUse);
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Bu elan üçün müraciət linki/emaili tapılmadı'),
      ),
    );
  }

  void _showApplyChoiceSheet(String url, String email) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.cardDark : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? Colors.white24 : Colors.black26,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Müraciət Üsulunu Seçin',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  _applyByEmail(email);
                },
                icon: const Icon(LucideIcons.mail, color: Colors.white),
                label: Text('E-mail ilə müraciət ($email)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryOrange,
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  _launchUrlStr(url);
                },
                icon: const Icon(LucideIcons.globe, color: AppTheme.primaryOrange),
                label: const Text('Veb Sayt vasitəsilə müraciət'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                  side: const BorderSide(color: AppTheme.primaryOrange),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _applyByEmail(String emailStr) async {
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
    final Uri mailUri = Uri(
      scheme: 'mailto',
      path: cleanEmail,
      queryParameters: {'subject': 'Müraciət: ${widget.job.title}'},
    );
    try {
      if (await canLaunchUrl(mailUri)) {
        await launchUrl(mailUri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  Future<void> _launchUrlStr(String urlStr) async {
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
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Keçid xətası: $e')),
        );
      }
    }
  }

  String _formatDate(DateTime dt) {
    try {
      return DateFormat('yyyy-MM-dd').format(dt);
    } catch (_) {
      return '';
    }
  }

  List<Map<String, dynamic>> _parseDescriptionElements(String text) {
    final cleaned = text.replaceAll(RegExp(r'<br\s*/?>|</li>|<p>'), '\n');
    final rawLines = cleaned.replaceAll(RegExp(r'<[^>]*>|&nbsp;'), ' ').split('\n');

    List<Map<String, dynamic>> elements = [];
    for (var line in rawLines) {
      final trimmed = line.trim();
      if (trimmed.isNotEmpty) {
        final isHeading = trimmed.endsWith(':') ||
            trimmed.startsWith('Vəzifə') ||
            trimmed.startsWith('Namizədə') ||
            trimmed.startsWith('İş şəraiti') ||
            trimmed.startsWith('Əsas') ||
            trimmed.startsWith('İşə qəbul');

        final cleanContent = trimmed.replaceAll(RegExp(r'^[•\-\*]\s*'), '');

        elements.add({
          'text': cleanContent,
          'isHeading': isHeading,
          'isBullet': !isHeading,
        });
      }
    }
    return elements;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final parsedElements = _parseDescriptionElements(widget.job.description);

    final contactEmail = (widget.job.company?['email'] as String?) ??
        widget.job.applicationEmail ??
        '';
    final contactWebsite = (widget.job.company?['website'] as String?) ??
        widget.job.applicationUrl ??
        '';

    return RepaintBoundary(
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.job.companyName),
          leading: IconButton(
            icon: const Icon(LucideIcons.x),
            onPressed: () => Navigator.pop(context, _views),
          ),
          actions: [
            ValueListenableBuilder<Set<String>>(
              valueListenable: FavoritesService.favoriteIdsNotifier,
              builder: (context, favSet, _) {
                final isFav = favSet.contains(widget.job.id);
                return IconButton(
                  icon: Icon(
                    isFav ? Icons.favorite : Icons.favorite_border,
                    color: isFav ? const Color(0xFFEF4444) : null,
                  ),
                  onPressed: _toggleFav,
                );
              },
            ),
          ],
        ),
        body: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Section
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                color: isDark ? AppTheme.cardDark : Colors.white,
                child: Column(
                  children: [
                    // Hero Animated Logo Avatar using CompanyLogoWidget
                    Hero(
                      tag: 'job_logo_${widget.job.id}',
                      child: CompanyLogoWidget(
                        logoUrl: widget.job.companyLogo,
                        companyName: widget.job.companyName,
                        size: 64,
                        borderRadius: 16,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Company Name
                    Text(
                      widget.job.companyName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textSecondaryLight,
                      ),
                    ),
                    const SizedBox(height: 4),

                    // Job Title
                    Text(
                      '${widget.job.title} vakansiyası',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark
                            ? AppTheme.textPrimaryDark
                            : AppTheme.textPrimaryLight,
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Category Pill Tag
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF3ED),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        widget.job.categoryName,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryOrange,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Attributes Row (Location, Salary, Views)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(LucideIcons.mapPin,
                            size: 14, color: AppTheme.primaryOrange),
                        const SizedBox(width: 4),
                        Text(widget.job.location,
                            style: const TextStyle(
                                fontSize: 13, fontWeight: FontWeight.w600)),
                        const SizedBox(width: 20),
                        const Icon(LucideIcons.banknote,
                            size: 14, color: AppTheme.primaryOrange),
                        const SizedBox(width: 4),
                        Text(
                          widget.job.salary != null && widget.job.salary!.isNotEmpty
                              ? '${widget.job.salary} AZN'
                              : 'Müzakirə',
                          style: const TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(width: 20),
                        const Icon(LucideIcons.eye,
                            size: 14, color: AppTheme.primaryOrange),
                        const SizedBox(width: 4),
                        Text('$_views',
                            style: const TextStyle(
                                fontSize: 13, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Action Buttons Row (Date, Saxla, Paylaş)
                    Row(
                      children: [
                        // Date Button
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? const Color(0xFF0F172A)
                                  : const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isDark
                                    ? AppTheme.borderDark
                                    : AppTheme.borderLight,
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(LucideIcons.clock,
                                    size: 14, color: AppTheme.primaryOrange),
                                const SizedBox(width: 4),
                                Text(
                                  _formatDate(widget.job.createdAt),
                                  style: const TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Saxla Button
                        Expanded(
                          child: ValueListenableBuilder<Set<String>>(
                            valueListenable: FavoritesService.favoriteIdsNotifier,
                            builder: (context, favSet, _) {
                              final isFav = favSet.contains(widget.job.id);
                              return InkWell(
                                onTap: _toggleFav,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? const Color(0xFF0F172A)
                                        : const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: isDark
                                          ? AppTheme.borderDark
                                          : AppTheme.borderLight,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        isFav ? Icons.favorite : Icons.favorite_border,
                                        size: 14,
                                        color: isFav
                                            ? const Color(0xFFEF4444)
                                            : AppTheme.primaryOrange,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        isFav ? 'Saxlanıldı' : 'Saxla',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: isFav ? const Color(0xFFEF4444) : null,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Paylaş Button
                        Expanded(
                          child: InkWell(
                            onTap: () {
                              Clipboard.setData(ClipboardData(
                                  text: 'https://jooble.az/vacancies/${widget.job.slug}'));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Link kopyalandı!')),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? const Color(0xFF0F172A)
                                    : const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isDark
                                      ? AppTheme.borderDark
                                      : AppTheme.borderLight,
                                ),
                              ),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(LucideIcons.share2,
                                      size: 14, color: AppTheme.primaryOrange),
                                  SizedBox(width: 4),
                                  Text(
                                    'Paylaş',
                                    style: TextStyle(
                                        fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Description Content Card
              Container(
                width: double.infinity,
                margin: const EdgeInsets.symmetric(horizontal: 16),
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
                    Text(
                      '${widget.job.title} vakansiyası - ${widget.job.companyName} iş elanları',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark
                            ? AppTheme.textPrimaryDark
                            : AppTheme.textPrimaryLight,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Paragraphs and Clean Bullets
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: parsedElements.map((elem) {
                        final bool isHeading = elem['isHeading'] == true;
                        final String text = elem['text'] as String;

                        if (isHeading) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 14, bottom: 8),
                            child: Text(
                              text,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: isDark
                                    ? AppTheme.textPrimaryDark
                                    : AppTheme.textPrimaryLight,
                              ),
                            ),
                          );
                        }

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                '• ',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryOrange,
                                  height: 1.3,
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  text,
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
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Contact Info Card
              if (contactEmail.isNotEmpty || contactWebsite.isNotEmpty)
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.all(16),
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
                      Text(
                        '${widget.job.companyName} - Əlaqə Məlumatları',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          if (contactEmail.isNotEmpty)
                            Expanded(
                              child: InkWell(
                                onTap: () async {
                                  await Clipboard.setData(
                                      ClipboardData(text: contactEmail));
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          content: Text(
                                              'E-mail nüsxələndi: $contactEmail')),
                                    );
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? const Color(0xFF0F172A)
                                        : const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(LucideIcons.mail,
                                          size: 18,
                                          color: AppTheme.primaryOrange),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const Text('E-mail',
                                                style: TextStyle(
                                                    fontSize: 11,
                                                    color: AppTheme
                                                        .textSecondaryLight)),
                                            Text(contactEmail,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                    fontSize: 12,
                                                    fontWeight:
                                                        FontWeight.w600)),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          if (contactEmail.isNotEmpty &&
                              contactWebsite.isNotEmpty)
                            const SizedBox(width: 10),
                          if (contactWebsite.isNotEmpty)
                            Expanded(
                              child: InkWell(
                                onTap: () => _launchUrlStr(contactWebsite),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? const Color(0xFF0F172A)
                                        : const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(LucideIcons.globe,
                                          size: 18,
                                          color: AppTheme.primaryOrange),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const Text('Veb Sayt',
                                                style: TextStyle(
                                                    fontSize: 11,
                                                    color: AppTheme
                                                        .textSecondaryLight)),
                                            Text(contactWebsite,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w600,
                                                    color:
                                                        AppTheme.primaryOrange)),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 16),

              // Oxşar Vakansiyalar Heading
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    Container(
                      width: 4,
                      height: 18,
                      color: AppTheme.primaryOrange,
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Oxşar Vakansiyalar',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),

              // Compact Similar Jobs 2-Column Grid (Sleek minimized cards!)
              _isLoadingSimilar
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: AppTheme.primaryOrange))
                  : Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 1.85,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                        ),
                        itemCount: _similarJobs.length,
                        itemBuilder: (context, index) {
                          return SimilarJobCard(job: _similarJobs[index]);
                        },
                      ),
                    ),

              const SizedBox(height: 16),

              // Telegram Channel Banner (Styled in Orange & Bold!)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFBFDBFE)),
                ),
                child: InkWell(
                  onTap: () => _launchUrlStr('https://t.me/joobleaz'),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.send,
                          color: AppTheme.primaryOrange, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: RichText(
                          text: const TextSpan(
                            style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFF1E40AF),
                            ),
                            children: [
                              TextSpan(
                                  text:
                                      'Vakansiyalar barədə məlumatı ən tez bizim '),
                              TextSpan(
                                text: 'Telegram',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryOrange,
                                ),
                              ),
                              TextSpan(
                                  text:
                                      ' kanalında izləyə bilərsiniz.'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 100),
            ],
          ),
        ),

        // Müraciət et Button
        bottomSheet: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.cardDark : Colors.white,
            border: Border(
              top: BorderSide(
                color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
              ),
            ),
          ),
          child: SafeArea(
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _applyJob,
                icon: const Icon(LucideIcons.send, color: Colors.white, size: 20),
                label: const Text(
                  'Müraciət et',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryOrange,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
