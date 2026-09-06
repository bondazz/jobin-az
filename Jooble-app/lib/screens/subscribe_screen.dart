import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/app_theme.dart';

class SubscribeScreen extends StatefulWidget {
  const SubscribeScreen({Key? key}) : super(key: key);

  @override
  State<SubscribeScreen> createState() => _SubscribeScreenState();
}

class _SubscribeScreenState extends State<SubscribeScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _keywordsController = TextEditingController();
  bool _isWhatsapp = true;
  bool _isSubscribed = false;

  @override
  void dispose() {
    _emailController.dispose();
    _keywordsController.dispose();
    super.dispose();
  }

  void _handleSubscribe() {
    if (_emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Xahiş olunur e-mail ünvanınızı daxil edin')),
      );
      return;
    }

    setState(() {
      _isSubscribed = true;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Uğurla abunə olundu! Yeni elanlar bildiriş olaraq göndəriləcək.'),
        backgroundColor: Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Abunə ol'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFE05328), Color(0xFFD97706)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.bell, color: Colors.white, size: 28),
                      SizedBox(width: 10),
                      Text(
                        'Vakansiya Bildirişləri',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Ən son iş elanlarını anında e-mail və ya WhatsApp vasitəsilə birinci siz alın!',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white.withValues(alpha: 0.9),
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Subscription Form Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.cardDark : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Axtarış Haqqında Məlumat',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // E-mail Input
                  const Text(
                    'E-mail ünvanınız *',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      hintText: 'nümunə@mail.com',
                      prefixIcon: Icon(LucideIcons.mail, size: 18),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Keywords / Position Input
                  const Text(
                    'Axtardığınız vəzifə və ya açar sözlər',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _keywordsController,
                    decoration: const InputDecoration(
                      hintText: 'Məsələn: Proqramçı, Sürücü, Dizayner...',
                      prefixIcon: Icon(LucideIcons.search, size: 18),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // WhatsApp Notification Checkbox
                  SwitchListTile(
                    value: _isWhatsapp,
                    onChanged: (val) => setState(() => _isWhatsapp = val),
                    activeThumbColor: AppTheme.primaryOrange,
                    contentPadding: EdgeInsets.zero,
                    title: const Text(
                      'WhatsApp bildirişləri alsın',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      'İş elanları birbaşa WhatsApp nömrənizə göndəriləcək',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Submit Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: _handleSubscribe,
                      icon: Icon(
                        _isSubscribed ? LucideIcons.check : LucideIcons.bellRing,
                        color: Colors.white,
                      ),
                      label: Text(
                        _isSubscribed ? 'Abunə Olunub' : 'Abunə Ol',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isSubscribed
                            ? Colors.green
                            : AppTheme.primaryOrange,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
