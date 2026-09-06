class Company {
  final String id;
  final String name;
  final String slug;
  final String? rawLogo;
  final String? rawBackgroundImage;
  final String? description;
  final String? website;
  final String? email;
  final String? phone;
  final String? address;
  final bool isVerified;
  final int jobCount;

  Company({
    required this.id,
    required this.name,
    required this.slug,
    this.rawLogo,
    this.rawBackgroundImage,
    this.description,
    this.website,
    this.email,
    this.phone,
    this.address,
    required this.isVerified,
    this.jobCount = 0,
  });

  factory Company.fromJson(Map<String, dynamic> json) {
    int count = 0;
    if (json['jobCount'] != null) {
      count = json['jobCount'] as int;
    } else if (json['jobs'] != null && json['jobs'] is List) {
      count = (json['jobs'] as List).length;
    }

    return Company(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      rawLogo: json['logo'] ?? json['logo_url'] ?? json['image'],
      rawBackgroundImage: json['background_image'] ?? json['cover_image'],
      description: json['description'],
      website: json['website'],
      email: json['email'],
      phone: json['phone'],
      address: json['address'],
      isVerified: json['is_verified'] ?? false,
      jobCount: count,
    );
  }

  String? get logo {
    if (rawLogo == null || rawLogo!.trim().isEmpty) return null;
    final trimmed = rawLogo!.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      if (trimmed.startsWith('/')) {
        return 'https://jooble.az$trimmed';
      } else {
        return 'https://jooble.az/$trimmed';
      }
    }
    return trimmed;
  }

  String? get backgroundImage {
    if (rawBackgroundImage == null || rawBackgroundImage!.trim().isEmpty) return null;
    final trimmed = rawBackgroundImage!.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      if (trimmed.startsWith('/')) {
        return 'https://jooble.az$trimmed';
      } else {
        return 'https://jooble.az/$trimmed';
      }
    }
    return trimmed;
  }
}
