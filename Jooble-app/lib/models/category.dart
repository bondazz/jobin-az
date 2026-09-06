class Category {
  final String id;
  final String name;
  final String slug;
  final String? icon;
  final String? description;

  Category({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
    this.description,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      icon: json['icon'],
      description: json['description'],
    );
  }
}
