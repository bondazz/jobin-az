import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class FavoritesService {
  static const String _key = 'savedJobs';

  static final ValueNotifier<Set<String>> favoriteIdsNotifier =
      ValueNotifier<Set<String>>({});
  static final ValueNotifier<int> favoriteCountNotifier =
      ValueNotifier<int>(0);

  static bool _isInitialized = false;

  static Future<void> init() async {
    if (_isInitialized) return;
    _isInitialized = true;
    final ids = await getFavoriteIds();
    favoriteIdsNotifier.value = ids.toSet();
    favoriteCountNotifier.value = ids.length;

    // Sync with Supabase in background
    _syncFromSupabase();
  }

  static Future<List<String>> getFavoriteIds() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_key) ?? [];
    return list;
  }

  static Future<bool> isFavorite(String jobId) async {
    await init();
    return favoriteIdsNotifier.value.contains(jobId);
  }

  static Future<void> toggleFavorite(String jobId) async {
    final prefs = await SharedPreferences.getInstance();
    final list = (prefs.getStringList(_key) ?? []).toSet();

    if (list.contains(jobId)) {
      list.remove(jobId);
    } else {
      list.add(jobId);
    }

    await prefs.setStringList(_key, list.toList());

    // Update real-time notifiers instantly
    favoriteIdsNotifier.value = list.toSet();
    favoriteCountNotifier.value = list.length;

    // Sync to Supabase
    _syncToSupabase(list.toList());
  }

  static Future<void> _syncToSupabase(List<String> jobIds) async {
    try {
      final client = Supabase.instance.client;
      final user = client.auth.currentUser;
      if (user != null) {
        await client.from('user_saved_jobs').upsert({
          'user_id': user.id,
          'saved_job_ids': jobIds,
          'updated_at': DateTime.now().toIso8601String(),
        });
      }
    } catch (_) {
      // Graceful fallback if table is not configured yet
    }
  }

  static Future<void> _syncFromSupabase() async {
    try {
      final client = Supabase.instance.client;
      final user = client.auth.currentUser;
      if (user != null) {
        final response = await client
            .from('user_saved_jobs')
            .select('saved_job_ids')
            .eq('user_id', user.id)
            .maybeSingle();

        if (response != null && response['saved_job_ids'] != null) {
          final List<dynamic> remoteList = response['saved_job_ids'];
          final remoteIds = remoteList.map((e) => e.toString()).toSet();

          final currentSet = favoriteIdsNotifier.value;
          final merged = {...currentSet, ...remoteIds};

          final prefs = await SharedPreferences.getInstance();
          await prefs.setStringList(_key, merged.toList());

          favoriteIdsNotifier.value = merged;
          favoriteCountNotifier.value = merged.length;
        }
      }
    } catch (_) {
      // Ignore if table does not exist
    }
  }
}
