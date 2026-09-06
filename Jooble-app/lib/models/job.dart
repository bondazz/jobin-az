class Job {
  final String id;
  final String title;
  final String slug;
  final String description;
  final String location;
  final String? salary;
  final String type; // full-time, part-time, remote, etc.
  final String? categoryId;
  final String? companyId;
  final String? applicationUrl;
  final String? applicationEmail;
  final DateTime createdAt;
  final int views;
  final Map<String, dynamic>? company;
  final Map<String, dynamic>? category;
  final String? directCompanyLogo;

  Job({
    required this.id,
    required this.title,
    required this.slug,
    required this.description,
    required this.location,
    this.salary,
    required this.type,
    this.categoryId,
    this.companyId,
    this.applicationUrl,
    this.applicationEmail,
    required this.createdAt,
    required this.views,
    this.company,
    this.category,
    this.directCompanyLogo,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'] ?? '',
      location: json['location'] ?? 'Bakı',
      salary: json['salary'],
      type: json['type'] ?? 'full-time',
      categoryId: json['category_id'],
      companyId: json['company_id'],
      applicationUrl: json['application_url'],
      applicationEmail: json['application_email'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      views: json['views'] ?? 0,
      company: json['companies'] as Map<String, dynamic>?,
      category: json['categories'] as Map<String, dynamic>?,
      directCompanyLogo: json['company_logo'] ?? json['logo'],
    );
  }

  String get companyName => company?['name'] ?? 'Məxfilik qorunur';

  String? get companyLogo {
    String? raw = company?['logo'] ??
        company?['logo_url'] ??
        company?['image'] ??
        company?['avatar_url'] ??
        directCompanyLogo;

    if (raw == null || raw.trim().isEmpty) return null;

    final trimmed = raw.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      if (trimmed.startsWith('/')) {
        return 'https://jooble.az$trimmed';
      } else {
        return 'https://jooble.az/$trimmed';
      }
    }
    return trimmed;
  }

  String get categoryName => category?['name'] ?? 'Ümumi';
}
