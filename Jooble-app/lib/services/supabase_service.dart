import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/job.dart';
import '../models/company.dart';
import '../models/category.dart';

class AdvertisementItem {
  final String id;
  final String title;
  final String? description;
  final String imageUrl;
  final String? linkUrl;
  final String position;

  AdvertisementItem({
    required this.id,
    required this.title,
    this.description,
    required this.imageUrl,
    this.linkUrl,
    required this.position,
  });

  factory AdvertisementItem.fromJson(Map<String, dynamic> json) {
    String rawImg = json['image_url'] ?? json['image'] ?? '';
    if (rawImg.isNotEmpty &&
        !rawImg.startsWith('http://') &&
        !rawImg.startsWith('https://')) {
      rawImg = rawImg.startsWith('/')
          ? 'https://jooble.az$rawImg'
          : 'https://jooble.az/$rawImg';
    }

    return AdvertisementItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      imageUrl: rawImg,
      linkUrl: json['link_url'] ?? json['link'],
      position: json['position'] ?? 'job_listing',
    );
  }
}

class SupabaseService {
  final SupabaseClient _client = Supabase.instance.client;

  SupabaseClient get client => _client;

  Future<List<Job>> fetchJobs({
    String? searchQuery,
    String? location,
    String? workType,
    String? categoryId,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      var query = _client.from('jobs').select('*, companies(*), categories(*)');

      query = query.eq('is_active', true);

      if (searchQuery != null && searchQuery.trim().isNotEmpty) {
        query = query.ilike('title', '%${searchQuery.trim()}%');
      }

      if (location != null &&
          location.trim().isNotEmpty &&
          location != 'Bütün regionlar') {
        query = query.ilike('location', '%${location.trim()}%');
      }

      if (workType != null &&
          workType.trim().isNotEmpty &&
          workType != 'Bütün tiplər') {
        query = query.eq('type', workType.trim());
      }

      if (categoryId != null && categoryId.isNotEmpty) {
        query = query.eq('category_id', categoryId);
      }

      final response = await query
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      final data = response as List<dynamic>;
      return data
          .map((json) => Job.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<List<Company>> fetchCompanies({String? queryStr}) async {
    try {
      var query = _client.from('companies').select('*, jobs!company_id(id)').eq('is_active', true);

      if (queryStr != null && queryStr.trim().isNotEmpty) {
        query = query.ilike('name', '%${queryStr.trim()}%');
      }

      final response = await query;
      final data = response as List<dynamic>;
      final list = data
          .map((json) => Company.fromJson(json as Map<String, dynamic>))
          .toList();

      list.sort((a, b) => b.jobCount.compareTo(a.jobCount));
      return list;
    } catch (e) {
      return [];
    }
  }

  Future<List<Category>> fetchCategories() async {
    try {
      final response = await _client
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name', ascending: true);

      final data = response as List<dynamic>;
      return data
          .map((json) => Category.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  // Fetch daily active jobs count (created_at >= today 00:00:00)
  Future<int> fetchDailyJobsCount() async {
    try {
      final now = DateTime.now();
      final startOfToday =
          DateTime(now.year, now.month, now.day).toIso8601String();
      final response = await _client
          .from('jobs')
          .select('id')
          .eq('is_active', true)
          .gte('created_at', startOfToday);
      return (response as List).length;
    } catch (e) {
      return 14;
    }
  }

  // Fetch monthly active jobs count (created_at >= 1st of current month)
  Future<int> fetchMonthlyJobsCount() async {
    try {
      final now = DateTime.now();
      final startOfMonth = DateTime(now.year, now.month, 1).toIso8601String();
      final response = await _client
          .from('jobs')
          .select('id')
          .eq('is_active', true)
          .gte('created_at', startOfMonth);
      return (response as List).length;
    } catch (e) {
      return 350;
    }
  }

  // Fetch jobs for a specific company
  Future<List<Job>> fetchJobsByCompany(String companyId) async {
    try {
      final response = await _client
          .from('jobs')
          .select('*, companies(*), categories(*)')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .order('created_at', ascending: false);

      final data = response as List<dynamic>;
      return data
          .map((json) => Job.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  // RPC caller for get_job_application_email
  Future<String?> getJobApplicationEmail(String jobId) async {
    try {
      final response = await _client
          .rpc('get_job_application_email', params: {'job_id': jobId});
      if (response != null && response.toString().trim().isNotEmpty) {
        return response.toString().trim();
      }
    } catch (_) {}
    return null;
  }

  // Increment job view count in database
  Future<void> incrementJobViews(String jobId) async {
    try {
      await _client.rpc('increment_job_views', params: {'job_id': jobId});
    } catch (_) {
      try {
        final jobData = await _client
            .from('jobs')
            .select('views')
            .eq('id', jobId)
            .maybeSingle();
        if (jobData != null) {
          final currentViews = (jobData['views'] as int?) ?? 0;
          await _client
              .from('jobs')
              .update({'views': currentViews + 1}).eq('id', jobId);
        }
      } catch (_) {}
    }
  }

  // Fetch active advertisements from database
  Future<List<AdvertisementItem>> fetchAdvertisements(
      {String position = 'job_listing'}) async {
    try {
      final response = await _client
          .from('advertisements')
          .select('*')
          .eq('position', position)
          .eq('is_active', true)
          .order('display_order', ascending: true);

      final data = response as List<dynamic>;
      return data
          .map((json) =>
              AdvertisementItem.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  // Track advertisement click count in database
  Future<void> trackAdClick(String adId) async {
    try {
      await _client.rpc('increment_ad_clicks', params: {'ad_id': adId});
    } catch (_) {}
  }

  // Increment blog post views count in database
  Future<void> incrementBlogViews(String postId) async {
    try {
      await _client.rpc('increment_blog_views', params: {'post_id': postId});
    } catch (_) {
      try {
        final postData = await _client
            .from('blog_posts')
            .select('views')
            .eq('id', postId)
            .maybeSingle();
        if (postData != null) {
          final currentViews = (postData['views'] as int?) ?? 0;
          await _client
              .from('blog_posts')
              .update({'views': currentViews + 1}).eq('id', postId);
        }
      } catch (_) {}
    }
  }
}
