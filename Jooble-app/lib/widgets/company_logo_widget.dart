import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';

class CompanyLogoWidget extends StatelessWidget {
  final String? logoUrl;
  final String companyName;
  final double size;
  final double borderRadius;

  const CompanyLogoWidget({
    Key? key,
    required this.logoUrl,
    required this.companyName,
    this.size = 42,
    this.borderRadius = 8,
  }) : super(key: key);

  String? get _formattedUrl {
    if (logoUrl == null || logoUrl!.trim().isEmpty) return null;
    String trimmed = logoUrl!.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = trimmed.startsWith('/')
          ? 'https://jooble.az$trimmed'
          : 'https://jooble.az/$trimmed';
    }
    return Uri.encodeFull(trimmed);
  }

  bool get _isSvg {
    final url = _formattedUrl;
    if (url == null) return false;
    return url.toLowerCase().contains('.svg');
  }

  @override
  Widget build(BuildContext context) {
    final url = _formattedUrl;

    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: Container(
        width: size,
        height: size,
        color: Colors.white, // White background container prevents SVG black fill artifacts
        child: url != null && url.isNotEmpty
            ? _isSvg
                ? SvgPicture.network(
                    url,
                    width: size,
                    height: size,
                    fit: BoxFit.contain,
                    placeholderBuilder: (_) => _buildInitial(),
                  )
                : CachedNetworkImage(
                    imageUrl: url,
                    width: size,
                    height: size,
                    memCacheWidth: (size * 2).toInt(),
                    memCacheHeight: (size * 2).toInt(),
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Image.network(
                      url,
                      width: size,
                      height: size,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _buildInitial(),
                    ),
                  )
            : _buildInitial(),
      ),
    );
  }

  Widget _buildInitial() {
    final firstChar = companyName.trim().isNotEmpty
        ? companyName.trim()[0].toUpperCase()
        : 'J';
    return Center(
      child: Text(
        firstChar,
        style: TextStyle(
          fontSize: size * 0.42,
          fontWeight: FontWeight.bold,
          color: AppTheme.primaryOrange,
        ),
      ),
    );
  }
}
