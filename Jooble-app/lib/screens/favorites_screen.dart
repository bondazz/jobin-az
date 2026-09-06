import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/job.dart';
import '../services/favorites_service.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/job_card.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({Key? key}) : super(key: key);

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final SupabaseService _service = SupabaseService();
  List<Job> _favJobs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFavorites();

    FavoritesService.favoriteIdsNotifier.addListener(_loadFavorites);
  }

  @override
  void dispose() {
    FavoritesService.favoriteIdsNotifier.removeListener(_loadFavorites);
    super.dispose();
  }

  Future<void> _loadFavorites() async {
    final favIds = await FavoritesService.getFavoriteIds();
    if (favIds.isEmpty) {
      if (mounted) {
        setState(() {
          _favJobs = [];
          _isLoading = false;
        });
      }
      return;
    }

    final allJobs = await _service.fetchJobs(limit: 100);
    final filtered = allJobs.where((j) => favIds.contains(j.id)).toList();

    if (mounted) {
      setState(() {
        _favJobs = filtered;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Saxlanılan İşlər'),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primaryOrange),
            )
          : _favJobs.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        LucideIcons.bookmark,
                        size: 56,
                        color: isDark ? Colors.white38 : Colors.black38,
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Hələ ki heç bir elan saxlanılmayıb',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Bəyəndiyiniz elanları saxlayaraq burada baxa bilərsiniz',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppTheme.textSecondaryLight,
                        ),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  color: AppTheme.primaryOrange,
                  onRefresh: _loadFavorites,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: _favJobs.length,
                    itemBuilder: (context, index) {
                      final job = _favJobs[index];
                      return JobCard(
                        job: job,
                        onFavoriteChanged: _loadFavorites,
                      );
                    },
                  ),
                ),
    );
  }
}
