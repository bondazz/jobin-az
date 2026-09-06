import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/job.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/job_card.dart';
import '../widgets/shimmer_job_card_skeleton.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback? onOpenAddJob;

  const HomeScreen({Key? key, this.onOpenAddJob}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final SupabaseService _service = SupabaseService();
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _cityController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<Job> _jobs = [];
  List<AdvertisementItem> _dbAds = [];
  bool _isLoading = true;
  bool _isFetchingMore = false;
  bool _hasMore = true;
  int _offset = 0;
  final int _limit = 20;

  @override
  void initState() {
    super.initState();
    _loadInitialJobs();
    _loadAds();

    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
              _scrollController.position.maxScrollExtent - 300 &&
          !_isFetchingMore &&
          !_isLoading &&
          _hasMore) {
        _loadMoreJobs();
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  Future<void> _loadAds() async {
    final ads = await _service.fetchAdvertisements(position: 'job_listing');
    if (mounted) {
      setState(() {
        _dbAds = ads;
      });
    }
  }

  Future<void> _loadInitialJobs() async {
    setState(() {
      _isLoading = true;
      _offset = 0;
      _hasMore = true;
    });

    final newJobs = await _service.fetchJobs(
      searchQuery: _searchController.text,
      location: _cityController.text,
      limit: _limit,
      offset: 0,
    );

    if (mounted) {
      setState(() {
        _jobs = newJobs;
        _isLoading = false;
        _offset = newJobs.length;
        if (newJobs.length < _limit) {
          _hasMore = false;
        }
      });
    }
  }

  // Smooth Pull-to-Refresh without centered duplicate spinners
  Future<void> _handleRefresh() async {
    final newJobs = await _service.fetchJobs(
      searchQuery: _searchController.text,
      location: _cityController.text,
      limit: _limit,
      offset: 0,
    );
    await _loadAds();

    if (mounted) {
      setState(() {
        _jobs = newJobs;
        _offset = newJobs.length;
        _hasMore = newJobs.length >= _limit;
      });
    }
  }

  Future<void> _loadMoreJobs() async {
    if (_isFetchingMore || !_hasMore) return;

    setState(() {
      _isFetchingMore = true;
    });

    final nextBatch = await _service.fetchJobs(
      searchQuery: _searchController.text,
      location: _cityController.text,
      limit: _limit,
      offset: _offset,
    );

    if (mounted) {
      setState(() {
        _isFetchingMore = false;
        if (nextBatch.isEmpty) {
          _hasMore = false;
        } else {
          _jobs.addAll(nextBatch);
          _offset += nextBatch.length;
          if (nextBatch.length < _limit) {
            _hasMore = false;
          }
        }
      });
    }
  }

  Future<void> _launchExternalUrl(String urlStr) async {
    if (urlStr.isEmpty) return;
    String cleanUrl = urlStr.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://$cleanUrl';
    }
    final Uri uri = Uri.parse(cleanUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.cardDark : Colors.white,
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
                  ),
                ),
              ),
              child: Column(
                children: [
                  // Official Logo + "+ Elan yerləşdir" Button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Image.asset(
                        'assets/images/logo.png',
                        height: 28,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => const Text(
                          'Jooble.',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                      InkWell(
                        onTap: widget.onOpenAddJob,
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF3ED),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppTheme.primaryOrange),
                          ),
                          child: const Row(
                            children: [
                              Icon(LucideIcons.plusCircle,
                                  size: 15, color: AppTheme.primaryOrange),
                              SizedBox(width: 4),
                              Text(
                                'Elan yerləşdir',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryOrange,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Search Bar Row ("İş axtarın" | "Şəhər")
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF0F172A)
                                : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: TextField(
                            controller: _searchController,
                            onSubmitted: (_) => _loadInitialJobs(),
                            style: const TextStyle(fontSize: 13),
                            decoration: const InputDecoration(
                              hintText: 'İş axtarın',
                              prefixIcon: Icon(LucideIcons.search, size: 16),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF0F172A)
                                : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: TextField(
                            controller: _cityController,
                            onSubmitted: (_) => _loadInitialJobs(),
                            style: const TextStyle(fontSize: 13),
                            decoration: const InputDecoration(
                              hintText: 'Şəhər',
                              prefixIcon: Icon(LucideIcons.mapPin, size: 16),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Jobs Feed
            Expanded(
              child: _isLoading
                  ? ListView.builder(
                      itemCount: 10,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemBuilder: (_, __) => const ShimmerJobCardSkeleton(),
                    )
                  : _jobs.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                LucideIcons.searchX,
                                size: 48,
                                color: isDark ? Colors.white38 : Colors.black38,
                              ),
                              const SizedBox(height: 10),
                              const Text(
                                'Axtarışa uyğun vakansiya tapılmadı',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 6),
                              ElevatedButton(
                                onPressed: () {
                                  _searchController.clear();
                                  _cityController.clear();
                                  _loadInitialJobs();
                                },
                                child: const Text('Filtrləri Sıfırla'),
                              ),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          color: AppTheme.primaryOrange,
                          backgroundColor: isDark ? AppTheme.cardDark : Colors.white,
                          displacement: 30,
                          onRefresh: _handleRefresh,
                          child: ListView.builder(
                            controller: _scrollController,
                            cacheExtent: 1200.0,
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            itemCount: _calculateItemCount(),
                            physics: const AlwaysScrollableScrollPhysics(),
                            itemBuilder: (context, index) {
                              if (_hasMore && index == _calculateItemCount() - 1) {
                                return const Padding(
                                  padding: EdgeInsets.all(16.0),
                                  child: Center(
                                    child: CircularProgressIndicator(
                                      color: AppTheme.primaryOrange,
                                      strokeWidth: 2,
                                    ),
                                  ),
                                );
                              }

                              // Check if item is Advertisement Banner (Inserted every 6 jobs!)
                              if (_isAdIndex(index)) {
                                final adIndex = ((index + 1) ~/ 7) - 1;
                                return RepaintBoundary(child: _buildAdBanner(adIndex));
                              }

                              final jobIndex = _getJobIndexForListItem(index);
                              if (jobIndex < _jobs.length) {
                                return RepaintBoundary(child: JobCard(job: _jobs[jobIndex]));
                              }

                              return const SizedBox();
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  int _calculateItemCount() {
    int count = _jobs.length;
    int ads = _jobs.length ~/ 6;
    return count + ads + (_hasMore ? 1 : 0);
  }

  bool _isAdIndex(int index) {
    if (index == 0) return false;
    return (index + 1) % 7 == 0;
  }

  int _getJobIndexForListItem(int index) {
    int adsBefore = (index + 1) ~/ 7;
    return index - adsBefore;
  }

  Widget _buildAdBanner(int adIndex) {
    if (_dbAds.isNotEmpty) {
      final ad = _dbAds[adIndex % _dbAds.length];
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: InkWell(
          onTap: () {
            _service.trackAdClick(ad.id);
            if (ad.linkUrl != null && ad.linkUrl!.isNotEmpty) {
              _launchExternalUrl(ad.linkUrl!);
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Container(
              constraints: const BoxConstraints(maxHeight: 120),
              color: Colors.black12,
              child: CachedNetworkImage(
                imageUrl: ad.imageUrl,
                width: double.infinity,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => _buildFallbackWhatsAppAdBanner(),
              ),
            ),
          ),
        ),
      );
    }

    return _buildFallbackWhatsAppAdBanner();
  }

  Widget _buildFallbackWhatsAppAdBanner() {
    return InkWell(
      onTap: () => _launchExternalUrl('https://wa.me/?text=Jooble.az%20vakansiyalar'),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFFE05328), Color(0xFFD97706)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFE05328).withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Colors.white24,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                LucideIcons.messageCircle,
                color: Colors.white,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'VAKANSİYALAR BİRBAŞA',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white70,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    'WHATSAPP-DA! Jooble.',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(LucideIcons.chevronRight, color: Colors.white),
          ],
        ),
      ),
    );
  }
}
