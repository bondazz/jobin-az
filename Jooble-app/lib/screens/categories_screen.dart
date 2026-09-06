import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../models/category.dart';
import '../models/job.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/job_card.dart';

class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({Key? key}) : super(key: key);

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  final SupabaseService _service = SupabaseService();
  final TextEditingController _searchController = TextEditingController();

  List<Category> _categories = [];
  Category? _selectedCategory;
  List<Job> _categoryJobs = [];
  bool _isLoading = true;
  bool _isLoadingJobs = false;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    final list = await _service.fetchCategories();
    if (mounted) {
      setState(() {
        _categories = list;
        _isLoading = false;
      });
    }
  }

  Future<void> _onCategoryClick(Category category) async {
    setState(() {
      _selectedCategory = category;
      _isLoadingJobs = true;
    });

    final jobs = await _service.fetchJobs(categoryId: category.id, limit: 50);

    if (mounted) {
      setState(() {
        _categoryJobs = jobs;
        _isLoadingJobs = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _selectedCategory != null ? _selectedCategory!.name : 'Kateqoriyalar',
        ),
        leading: _selectedCategory != null
            ? IconButton(
                icon: const Icon(LucideIcons.arrowLeft),
                onPressed: () {
                  setState(() {
                    _selectedCategory = null;
                    _categoryJobs = [];
                  });
                },
              )
            : null,
      ),
      body: _selectedCategory != null
          // Category Vacancies View
          ? Column(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  color: isDark ? AppTheme.cardDark : Colors.white,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${_selectedCategory!.name} Vakansiyaları',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${_categoryJobs.length} aktiv iş elanı tapıldı',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppTheme.textSecondaryLight,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: _isLoadingJobs
                      ? const Center(
                          child: CircularProgressIndicator(
                              color: AppTheme.primaryOrange),
                        )
                      : _categoryJobs.isEmpty
                          ? const Center(
                              child: Text('Bu kateqoriyada aktiv elan tapılmadı'),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              itemCount: _categoryJobs.length,
                              itemBuilder: (context, index) {
                                return JobCard(job: _categoryJobs[index]);
                              },
                            ),
                ),
              ],
            )
          // Main Categories List (Vertical list matching web CategoriesClient.tsx!)
          : Column(
              children: [
                // Search Box
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: 'Kateqoriya axtarın...',
                      prefixIcon: const Icon(LucideIcons.search, size: 18),
                      filled: true,
                      fillColor: isDark
                          ? const Color(0xFF0F172A)
                          : const Color(0xFFF1F5F9),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),

                Expanded(
                  child: _isLoading
                      ? const Center(
                          child: CircularProgressIndicator(
                              color: AppTheme.primaryOrange),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _getFilteredCategories().length,
                          itemBuilder: (context, index) {
                            final cat = _getFilteredCategories()[index];
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? AppTheme.cardDark
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isDark
                                      ? AppTheme.borderDark
                                      : AppTheme.borderLight,
                                ),
                              ),
                              child: ListTile(
                                onTap: () => _onCategoryClick(cat),
                                leading: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFF3ED),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(
                                    LucideIcons.tag,
                                    color: AppTheme.primaryOrange,
                                    size: 20,
                                  ),
                                ),
                                title: Text(
                                  cat.name,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: isDark
                                        ? AppTheme.textPrimaryDark
                                        : AppTheme.textPrimaryLight,
                                  ),
                                ),
                                subtitle: cat.description != null &&
                                        cat.description!.isNotEmpty
                                    ? Text(
                                        cat.description!
                                            .replaceAll(RegExp(r'<[^>]*>|&nbsp;'), ' '),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontSize: 12),
                                      )
                                    : null,
                                trailing: const Icon(LucideIcons.chevronRight,
                                    size: 18),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }

  List<Category> _getFilteredCategories() {
    final query = _searchController.text.trim().toLowerCase();
    if (query.isEmpty) return _categories;
    return _categories
        .where((c) => c.name.toLowerCase().contains(query))
        .toList();
  }
}
