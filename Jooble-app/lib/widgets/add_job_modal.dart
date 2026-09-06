import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:webview_flutter/webview_flutter.dart';
import 'package:pay/pay.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../theme/app_theme.dart';

class AddJobModal extends StatefulWidget {
  const AddJobModal({Key? key}) : super(key: key);

  @override
  State<AddJobModal> createState() => _AddJobModalState();
}

class _AddJobModalState extends State<AddJobModal> {
  final _formKey = GlobalKey<FormState>();

  // Applicant Block (Müraciətçi Bloku)
  final TextEditingController _applicantNameController = TextEditingController();
  final TextEditingController _applicantSurnameController = TextEditingController();
  final TextEditingController _applicantPositionController = TextEditingController();
  final TextEditingController _applicantPhoneController = TextEditingController();

  // Company & Job Posting Block (Elan Bloku)
  final TextEditingController _companyNameController = TextEditingController();
  final TextEditingController _voenController = TextEditingController();
  final TextEditingController _websiteController = TextEditingController();
  final TextEditingController _companyDescController = TextEditingController();
  final TextEditingController _jobArticleController = TextEditingController();

  double _postingPrice = 15.0; // Default 15 AZN
  bool _isSubmitting = false;
  String? _referralCode;

  @override
  void initState() {
    super.initState();
    _fetchPostingPrice();
    _loadReferralCode();
  }

  Future<void> _fetchPostingPrice() async {
    try {
      final res = await Supabase.instance.client
          .from('site_settings')
          .select('value')
          .eq('key', 'job_posting_price')
          .maybeSingle();

      if (res != null && res['value'] != null) {
        final parsed = double.tryParse(res['value'].toString());
        if (parsed != null && parsed > 0) {
          setState(() {
            _postingPrice = parsed;
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _loadReferralCode() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final code = prefs.getString('referral_code');
      if (code != null && code.isNotEmpty) {
        setState(() {
          _referralCode = code;
        });
      }
    } catch (_) {}
  }

  Future<void> _submitJobAndPay({String? paymentMethod}) async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      final client = Supabase.instance.client;

      // 1. Check referral user if referral code exists
      String? referralUserId;
      if (_referralCode != null && _referralCode!.isNotEmpty) {
        try {
          final refRes = await client
              .from('referrals')
              .select('id')
              .eq('code', _referralCode!)
              .eq('is_active', true)
              .maybeSingle();

          if (refRes != null && refRes['id'] != null) {
            referralUserId = refRes['id'].toString();
          }
        } catch (_) {}
      }

      // Format clean phone number (10 digits)
      final cleanPhone = _applicantPhoneController.text.replaceAll(RegExp(r'\D'), '');

      // 2. INSERT into referral_job_submissions
      final insertRes = await client.from('referral_job_submissions').insert({
        'applicant_name': _applicantNameController.text.trim(),
        'applicant_surname': _applicantSurnameController.text.trim(),
        'applicant_position': _applicantPositionController.text.trim(),
        'applicant_phone': cleanPhone.isNotEmpty ? cleanPhone : _applicantPhoneController.text.trim(),
        'company_name': _companyNameController.text.trim(),
        'voen': _voenController.text.trim().isEmpty ? null : _voenController.text.trim(),
        'website': _websiteController.text.trim().isEmpty ? null : _websiteController.text.trim(),
        'company_description': _companyDescController.text.trim().isEmpty ? null : _companyDescController.text.trim(),
        'job_article': _jobArticleController.text.trim(),
        'referral_code': _referralCode,
        'referral_user_id': referralUserId,
        'status': 'awaiting_payment',
        'created_at': DateTime.now().toIso8601String(),
      }).select('id').single();

      final String submissionId = insertRes['id'].toString();

      // 3. POST to Edge Function epoint-create-payment
      const String edgeFunctionUrl = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/epoint-create-payment';
      const String anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncnR6ZnZwaGx0bm9pd2VkYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTQzMDYsImV4cCI6MjA2Nzc5MDMwNn0.afoeynzfpIZMqMRgpD0fDQ_NdULXEML-LZ-SocnYKp0';

      final httpRes = await http.post(
        Uri.parse(edgeFunctionUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $anonKey',
        },
        body: jsonEncode({
          'submission_id': submissionId,
          'amount': _postingPrice,
          'description': 'Jooble.az - İş elanı: ${_companyNameController.text.trim()}',
          'language': 'az',
          if (paymentMethod != null) 'payment_type': paymentMethod,
        }),
      );

      setState(() {
        _isSubmitting = false;
      });

      if (httpRes.statusCode == 200 || httpRes.statusCode == 201) {
        final resData = jsonDecode(httpRes.body);
        if (resData['success'] == true && resData['redirect_url'] != null) {
          final String redirectUrl = resData['redirect_url'].toString();

          if (mounted) {
            // Open In-App Payment Popup Modal (Does not exit app!)
            _openInAppPaymentModal(redirectUrl);
          }
        } else {
          final String errorMsg = resData['error'] ?? resData['message'] ?? 'Ödəniş linki yaradıla bilmədi';
          throw Exception(errorMsg);
        }
      } else {
        String errorMsg = 'Ödəniş servisi xətası (${httpRes.statusCode})';
        try {
          final resData = jsonDecode(httpRes.body);
          if (resData['error'] != null) {
            errorMsg = resData['error'].toString();
          } else if (resData['message'] != null) {
            errorMsg = resData['message'].toString();
          }
        } catch (_) {}
        if (errorMsg.contains("access to this operation")) {
          errorMsg = "Google Pay / Apple Pay ödənişi üçün Epoint hesabında aktivasiya gözlənilir.";
        }
        throw Exception(errorMsg);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
        String msg = e.toString().replaceAll('Exception: ', '');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: const Color(0xFFEF4444),
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  static const String _gpayConfigJson = '''{
    "provider": "google_pay",
    "data": {
      "environment": "PRODUCTION",
      "apiVersion": 2,
      "apiVersionMinor": 0,
      "allowedPaymentMethods": [
        {
          "type": "CARD",
          "tokenizationSpecification": {
            "type": "PAYMENT_GATEWAY",
            "parameters": {
              "gateway": "epoint",
              "gatewayMerchantId": "epoint"
            }
          },
          "parameters": {
            "allowedAuthMethods": ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            "allowedCardNetworks": ["VISA", "MASTERCARD"]
          }
        }
      ],
      "merchantInfo": {
        "merchantName": "Jooble.az"
      },
      "transactionInfo": {
        "totalPriceStatus": "FINAL",
        "totalPrice": "15.00",
        "currencyCode": "AZN"
      }
    }
  }''';

  Future<void> _handleGooglePayClick() async {
    if (!_formKey.currentState!.validate()) return;
    try {
      final payClient = Pay({
        PayProvider.google_pay: PaymentConfiguration.fromJsonString(_gpayConfigJson),
      });

      final bool canPay = await payClient.userCanPay(PayProvider.google_pay);
      if (canPay) {
        await payClient.showPaymentSelector(
          PayProvider.google_pay,
          [
            PaymentItem(
              label: 'Jooble.az - İş Elanı',
              amount: _postingPrice.toStringAsFixed(2),
              status: PaymentItemStatus.final_price,
            ),
          ],
        );
        return;
      }
    } catch (e) {
      debugPrint('Native Google Pay info: $e');
    }
    _submitJobAndPay(paymentMethod: 'gpay');
  }

  void _openInAppPaymentModal(String redirectUrl) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => EpointInAppPaymentModal(
        redirectUrl: redirectUrl,
        onPaymentSuccess: () {
          Navigator.pop(ctx); // Close WebView modal
          if (mounted) {
            Navigator.pop(context); // Close AddJobModal form
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Ödənişiniz uğurla həyata keçirildi! Elanınız admin tərəfindən yoxlanıldıqdan sonra dərc olunacaq.'),
                backgroundColor: Color(0xFF16A34A),
                duration: Duration(seconds: 5),
              ),
            );
          }
        },
        onPaymentError: () {
          Navigator.pop(ctx);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Ödəniş ləğv olundu və ya baş tutmadı.'),
                backgroundColor: Color(0xFFEF4444),
                duration: Duration(seconds: 4),
              ),
            );
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isIOS = Theme.of(context).platform == TargetPlatform.iOS;

    return Container(
      height: MediaQuery.of(context).size.height * 0.92,
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        top: 20,
        left: 20,
        right: 20,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardDark : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(LucideIcons.plusCircle, color: AppTheme.primaryOrange, size: 22),
                      const SizedBox(width: 8),
                      Text(
                        'İş Elanı Yerləşdir',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isDark
                              ? AppTheme.textPrimaryDark
                              : AppTheme.textPrimaryLight,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 16),

              // Section 1: Müraciətçi Məlumatları
              _buildSectionTitle('Müraciətçi Məlumatları', LucideIcons.user),
              const SizedBox(height: 10),

              // Applicant Name & Surname
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _applicantNameController,
                      validator: (val) =>
                          val == null || val.trim().isEmpty ? 'Adı daxil edin' : null,
                      decoration: _buildInputDecoration('Ad*', LucideIcons.user, isDark),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _applicantSurnameController,
                      validator: (val) =>
                          val == null || val.trim().isEmpty ? 'Soyadı daxil edin' : null,
                      decoration: _buildInputDecoration('Soyad*', LucideIcons.userCheck, isDark),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Applicant Position
              TextFormField(
                controller: _applicantPositionController,
                validator: (val) =>
                    val == null || val.trim().isEmpty ? 'Vəzifənizi daxil edin' : null,
                decoration: _buildInputDecoration('Vəzifəniz*', LucideIcons.briefcase, isDark),
              ),
              const SizedBox(height: 12),

              // Applicant Phone (10 Digits)
              TextFormField(
                controller: _applicantPhoneController,
                keyboardType: TextInputType.phone,
                maxLength: 15,
                inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9\s\(\)\-\+]'))],
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Telefon nömrəsini daxil edin';
                  }
                  final digits = val.replaceAll(RegExp(r'\D'), '');
                  if (digits.length < 9) {
                    return 'Düzgün telefon nömrəsi yazın (10 rəqəm)';
                  }
                  return null;
                },
                decoration: _buildInputDecoration('Telefon ((050) 993 77 66)*', LucideIcons.phone, isDark).copyWith(
                  counterText: '',
                ),
              ),

              const SizedBox(height: 20),

              // Section 2: Elan və Şirkət Məlumatları
              _buildSectionTitle('Elan və Şirkət Məlumatları', LucideIcons.building),
              const SizedBox(height: 10),

              // Company Name
              TextFormField(
                controller: _companyNameController,
                validator: (val) =>
                    val == null || val.trim().isEmpty ? 'Şirkət adını yazın' : null,
                decoration: _buildInputDecoration('Şirkətin adı*', LucideIcons.building, isDark),
              ),
              const SizedBox(height: 12),

              // VOEN & Website Row (Optional)
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _voenController,
                      keyboardType: TextInputType.number,
                      maxLength: 10,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      decoration: _buildInputDecoration('VÖEN (opsional)', LucideIcons.fileText, isDark).copyWith(
                        counterText: '',
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _websiteController,
                      keyboardType: TextInputType.url,
                      decoration: _buildInputDecoration('Veb sayt (opsional)', LucideIcons.globe, isDark),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Company Description (Optional)
              TextFormField(
                controller: _companyDescController,
                maxLines: 2,
                decoration: _buildInputDecoration('Şirkət haqqında ətraflı (opsional)', LucideIcons.info, isDark),
              ),
              const SizedBox(height: 12),

              // Job Article (Main Job Description) - Required
              TextFormField(
                controller: _jobArticleController,
                maxLines: 5,
                validator: (val) =>
                    val == null || val.trim().isEmpty ? 'Elanın əsas mətni tələb olunur' : null,
                decoration: _buildInputDecoration('Elanın əsas mətni (Vakansiya mətni)*', LucideIcons.alignLeft, isDark),
              ),

              const SizedBox(height: 20),

              // Pricing Badge Card
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFFFF3ED),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.primaryOrange.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(LucideIcons.creditCard, color: AppTheme.primaryOrange, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Elan Yerləşdirmə Haqqı',
                            style: TextStyle(fontSize: 11, color: AppTheme.textSecondaryLight),
                          ),
                          Text(
                            '${_postingPrice.toStringAsFixed(0)} AZN / 1 vakansiya (1 ay)',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Main "Ödəniş et — 15 AZN" Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : () => _submitJobAndPay(),
                  icon: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2),
                        )
                      : const Icon(LucideIcons.creditCard, color: Colors.white),
                  label: Text(
                    _isSubmitting
                        ? 'Yönləndirilir...'
                        : 'Ödəniş et — ${_postingPrice.toStringAsFixed(0)} AZN',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryOrange,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Google Pay / Apple Pay Dedicated Functional Button
              if (isIOS)
                // Apple Pay Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : () => _submitJobAndPay(paymentMethod: 'applepay'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.apple, color: Colors.white, size: 24),
                        SizedBox(width: 6),
                        Text(
                          'Apple Pay ilə Ödə',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                // Official Google Pay Button (Using Official 4-Color G Pay Vector SVG)
                GooglePayOfficialButton(
                  onPressed: _isSubmitting ? null : () => _handleGooglePayClick(),
                  isLoading: _isSubmitting,
                ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppTheme.primaryOrange),
        const SizedBox(width: 6),
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  InputDecoration _buildInputDecoration(String label, IconData icon, bool isDark) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(fontSize: 12),
      prefixIcon: Icon(icon, size: 16),
      filled: true,
      fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
        ),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    );
  }
}

// In-App Epoint Payment WebView Modal (Renders inside the app without opening external browser!)
class EpointInAppPaymentModal extends StatefulWidget {
  final String redirectUrl;
  final VoidCallback onPaymentSuccess;
  final VoidCallback onPaymentError;

  const EpointInAppPaymentModal({
    Key? key,
    required this.redirectUrl,
    required this.onPaymentSuccess,
    required this.onPaymentError,
  }) : super(key: key);

  @override
  State<EpointInAppPaymentModal> createState() => _EpointInAppPaymentModalState();
}

class _EpointInAppPaymentModalState extends State<EpointInAppPaymentModal> {
  late final WebViewController _webViewController;
  bool _isLoadingPage = true;

  @override
  void initState() {
    super.initState();
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setUserAgent("Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36")
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoadingPage = true;
            });
            _checkRedirect(url);
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoadingPage = false;
            });
            _checkRedirect(url);
          },
          onNavigationRequest: (NavigationRequest request) {
            if (_checkRedirect(request.url)) {
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.redirectUrl));
  }

  bool _checkRedirect(String url) {
    if (url.startsWith('https://jooble.az/add_job/success')) {
      widget.onPaymentSuccess();
      return true;
    } else if (url.startsWith('https://jooble.az/add_job/error')) {
      widget.onPaymentError();
      return true;
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      decoration: BoxDecoration(
        color: isDark ? AppTheme.cardDark : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              border: Border(
                bottom: BorderSide(
                  color: isDark ? AppTheme.borderDark : AppTheme.borderLight,
                ),
              ),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.lock, color: AppTheme.primaryOrange, size: 18),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Epoint Təhlükəsiz Ödəniş Portalı',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(LucideIcons.x, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          // Loading Bar
          if (_isLoadingPage)
            const LinearProgressIndicator(
              color: AppTheme.primaryOrange,
              backgroundColor: Colors.transparent,
              minHeight: 3,
            ),

          // WebView Container
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
              child: WebViewWidget(controller: _webViewController),
            ),
          ),
        ],
      ),
    );
  }
}

// Official Google Pay Button with Official 4-Color Vector SVG Logo (Google Brand Guidelines)
class GooglePayOfficialButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final bool isLoading;

  const GooglePayOfficialButton({
    Key? key,
    required this.onPressed,
    this.isLoading = false,
  }) : super(key: key);

  static const String _gpaySvg = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 136 44" width="136" height="44">
  <path fill="#4285F4" d="M37.38 21.84c0-.98-.08-1.92-.25-2.84H19.5v5.38h10.03c-.43 2.33-1.74 4.31-3.71 5.63v4.68h6.01c3.52-3.24 5.55-8.01 5.55-12.85z"/>
  <path fill="#34A853" d="M19.5 40c5.03 0 9.25-1.67 12.33-4.52l-6.01-4.68c-1.67 1.12-3.8 1.78-6.32 1.78-4.86 0-8.98-3.28-10.45-7.69H2.81v4.83C5.87 35.78 12.18 40 19.5 40z"/>
  <path fill="#FBBC05" d="M9.05 24.89c-.37-1.12-.58-2.32-.58-3.55 0-1.23.21-2.43.58-3.55v-4.83H2.81C1.56 15.52.85 18.34.85 21.34s.71 5.82 1.96 8.38l6.24-4.83z"/>
  <path fill="#EA4335" d="M19.5 10.36c2.74 0 5.2.94 7.13 2.78l5.35-5.35C28.74 4.88 24.53 3 19.5 3 12.18 3 5.87 7.22 2.81 13.26l6.24 4.83c1.47-4.41 5.59-7.73 10.45-7.73z"/>
  <path fill="#FFFFFF" d="M57.65 31.84v-23.7h7.24c3.48 0 6.13.91 7.95 2.73 1.84 1.82 2.76 4.14 2.76 6.96 0 2.84-.91 5.18-2.73 7.02-1.82 1.82-4.48 2.73-7.98 2.73h-3.41v4.26h-3.83zm3.83-7.67h3.48c2.35 0 4.1-.56 5.25-1.68 1.15-1.14 1.73-2.61 1.73-4.41 0-1.82-.57-3.28-1.71-4.38-1.14-1.1-2.89-1.65-5.27-1.65h-3.48v12.12zm23.63 7.96c-2.31 0-4.14-.62-5.49-1.86-1.33-1.26-2-2.91-2-4.95 0-2.19.78-3.89 2.34-5.1 1.56-1.23 3.66-1.85 6.3-1.85 2.29 0 4.16.42 5.61 1.26v-.78c0-1.54-.48-2.77-1.44-3.69-.96-.94-2.22-1.41-3.78-1.41-1.18 0-2.23.26-3.15.78-.92.5-1.56 1.18-1.92 2.04l-3.33-1.41c.64-1.39 1.69-2.5 3.15-3.33 1.48-.85 3.25-1.28 5.31-1.28 2.82 0 5.09.78 6.81 2.34 1.72 1.54 2.58 3.73 2.58 6.57v11.97h-3.63v-3.03h-.18c-.76 1.06-1.74 1.9-2.94 2.52-1.2.62-2.58.93-4.14.93zm.93-3.21c1.72 0 3.14-.49 4.26-1.47 1.14-.98 1.71-2.26 1.71-3.84-1.24-.76-2.86-1.14-4.86-1.14-1.84 0-3.25.38-4.23 1.14-.96.74-1.44 1.72-1.44 2.94 0 1.04.42 1.86 1.26 2.46.86.6 1.96.91 3.3.91zm23.65 10.53l-6.66-17.43h4.08l4.41 12.39h.18l4.35-12.39h3.99l-9.96 24.03h-3.99v-6.6h3.6z"/>
</svg>
''';

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: Color(0xFF3C4043), width: 1),
          ),
        ),
        child: isLoading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SvgPicture.string(
                    _gpaySvg,
                    height: 24,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'ile Ödə',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                      letterSpacing: 0.2,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
