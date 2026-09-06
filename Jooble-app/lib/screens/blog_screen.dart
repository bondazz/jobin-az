import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/shimmer_job_card_skeleton.dart';

class BlogScreen extends StatefulWidget {
  const BlogScreen({Key? key}) : super(key: key);

  @override
  State<BlogScreen> createState() => _BlogScreenState();
}

class _BlogScreenState extends State<BlogScreen> {
  final SupabaseService _service = SupabaseService();
  List<Map<String, dynamic>> _blogs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBlogs();
  }

  Future<void> _loadBlogs() async {
    try {
      final response = await _service.client
          .from('blogs')
          .select('*')
          .order('created_at', ascending: false);

      if (mounted) {
        setState(() {
          _blogs = List<Map<String, dynamic>>.from(response);
          _isLoading = false;
        });
      }
    } catch (e) {
      try {
        final fallback = await _service.client
            .from('blog_posts')
            .select('*')
            .order('created_at', ascending: false);
        if (mounted) {
          setState(() {
            _blogs = List<Map<String, dynamic>>.from(fallback);
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
  }

  String _formatDate(String? dtStr) {
    if (dtStr == null) return '2026';
    try {
      final dt = DateTime.parse(dtStr);
      return DateFormat('dd.MM.yyyy').format(dt);
    } catch (_) {
      return dtStr;
    }
  }

  void _openBlogDetail(Map<String, dynamic> blog) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final title = blog['title'] ?? 'Bloq Məqaləsi';
    final content = blog['content'] ?? blog['description'] ?? blog['excerpt'] ?? '';
    final imageUrl = blog['featured_image'] ?? blog['image_url'] ?? blog['og_image'];
    final postId = blog['id']?.toString() ?? '';

    // Increment blog views count in database & update local UI!
    if (postId.isNotEmpty) {
      _service.incrementBlogViews(postId);
      setState(() {
        blog['views'] = ((blog['views'] as int?) ?? 0) + 1;
      });
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.88,
        decoration: BoxDecoration(
          color: isDark ? AppTheme.cardDark : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Jooble Bloq',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (imageUrl != null && imageUrl.toString().isNotEmpty)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: CachedNetworkImage(
                          imageUrl: imageUrl.toString().startsWith('/')
                              ? 'https://jooble.az${imageUrl.toString()}'
                              : imageUrl.toString(),
                          width: double.infinity,
                          height: 200,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => const SizedBox(),
                        ),
                      ),
                    const SizedBox(height: 16),
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(LucideIcons.clock, size: 14, color: AppTheme.primaryOrange),
                        const SizedBox(width: 4),
                        Text(
                          _formatDate(blog['created_at']),
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondaryLight,
                          ),
                        ),
                        const SizedBox(width: 16),
                        const Icon(LucideIcons.eye, size: 14, color: AppTheme.primaryOrange),
                        const SizedBox(width: 4),
                        Text(
                          '${blog['views'] ?? 1}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondaryLight,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    _buildFormattedHtmlContent(content.toString(), isDark),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormattedHtmlContent(String htmlText, bool isDark) {
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
          textContent.length < 50 &&
              (textContent.startsWith('İş') ||
                  textContent.startsWith('Məsləhət') ||
                  textContent.startsWith('Nə üçün') ||
                  textContent.startsWith('Əsas') ||
                  textContent.startsWith('Nəticə'));

      if (isHeader) {
        children.add(
          Padding(
            padding: const EdgeInsets.only(top: 14, bottom: 8),
            child: Text(
              textContent,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? AppTheme.textPrimaryDark : AppTheme.textPrimaryLight,
              ),
            ),
          ),
        );
      } else if (isBullet) {
        children.add(
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
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
                      height: 1.6,
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
            padding: const EdgeInsets.only(bottom: 12),
            child: SelectableText(
              textContent,
              style: TextStyle(
                fontSize: 14,
                height: 1.65,
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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Jooble Bloq'),
      ),
      body: _isLoading
          ? ListView.builder(
              itemCount: 8,
              padding: const EdgeInsets.all(16),
              itemBuilder: (_, __) => const ShimmerJobCardSkeleton(),
            )
          : _blogs.isEmpty
              ? const Center(
                  child: Text('Hələ ki bloq məqaləsi yoxdur'),
                )
              : RefreshIndicator(
                  color: AppTheme.primaryOrange,
                  onRefresh: _loadBlogs,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _blogs.length,
                    itemBuilder: (context, index) {
                      final blog = _blogs[index];
                      final title = blog['title'] ?? '';
                      final excerpt = blog['excerpt'] ?? blog['content'] ?? '';
                      final imageUrl = blog['featured_image'] ?? blog['image_url'] ?? blog['og_image'];
                      final views = blog['views'] ?? 0;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: isDark ? AppTheme.cardDark : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
                          ),
                        ),
                        child: Material(
                          color: Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () => _openBlogDetail(blog),
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (imageUrl != null && imageUrl.toString().isNotEmpty)
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: CachedNetworkImage(
                                        imageUrl: imageUrl.toString().startsWith('/')
                                            ? 'https://jooble.az${imageUrl.toString()}'
                                            : imageUrl.toString(),
                                        width: double.infinity,
                                        height: 160,
                                        fit: BoxFit.cover,
                                        errorWidget: (_, __, ___) => const SizedBox(),
                                      ),
                                    ),
                                  const SizedBox(height: 12),
                                  Text(
                                    title,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  if (excerpt.toString().isNotEmpty) ...[
                                    const SizedBox(height: 6),
                                    Text(
                                      excerpt.toString().replaceAll(RegExp(r'<[^>]*>|&nbsp;'), ' '),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: AppTheme.textSecondaryLight,
                                      ),
                                    ),
                                  ],
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        _formatDate(blog['created_at']),
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: AppTheme.textSecondaryLight,
                                        ),
                                      ),
                                      Row(
                                        children: [
                                          const Icon(LucideIcons.eye, size: 13, color: Colors.grey),
                                          const SizedBox(width: 4),
                                          Text(
                                            '$views',
                                            style: const TextStyle(fontSize: 11, color: Colors.grey),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
