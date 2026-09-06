import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Exact colors extracted from Jooble mobile web design
  static const Color primaryOrange = Color(0xFFEA580C);
  static const Color primaryBlue = primaryOrange;
  static const Color primaryOrangeHover = Color(0xFFC2410C);
  static const Color primaryOrangeLight = Color(0xFFFFF7ED);
  static const Color accentOrange = Color(0xFFF97316);
  static const Color borderOrange = Color(0xFFFFEDD5);

  static const Color lightBg = Color(0xFFF4F5FB);
  static const Color darkBg = Color(0xFF0F172A);
  static const Color cardLight = Colors.white;
  static const Color cardDark = Color(0xFF1E293B);
  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color borderDark = Color(0xFF334155);

  static const Color textPrimaryLight = Color(0xFF0F172A);
  static const Color textSecondaryLight = Color(0xFF64748B);
  static const Color textPrimaryDark = Color(0xFFF8FAFC);
  static const Color textSecondaryDark = Color(0xFF94A3B8);

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: lightBg,
    primaryColor: primaryOrange,
    colorScheme: const ColorScheme.light(
      primary: primaryOrange,
      secondary: accentOrange,
      surface: cardLight,
    ),
    textTheme: GoogleFonts.sairaTextTheme(ThemeData.light().textTheme).copyWith(
      titleLarge: GoogleFonts.saira(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: textPrimaryLight,
      ),
      titleMedium: GoogleFonts.saira(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textPrimaryLight,
      ),
      bodyLarge: GoogleFonts.saira(
        fontSize: 15,
        color: textPrimaryLight,
      ),
      bodyMedium: GoogleFonts.saira(
        fontSize: 13,
        color: textSecondaryLight,
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.white,
      elevation: 0,
      iconTheme: const IconThemeData(color: textPrimaryLight),
      titleTextStyle: GoogleFonts.saira(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: textPrimaryLight,
      ),
    ),
    cardTheme: CardThemeData(
      color: cardLight,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: borderLight, width: 1),
      ),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: darkBg,
    primaryColor: primaryOrange,
    colorScheme: const ColorScheme.dark(
      primary: primaryOrange,
      secondary: accentOrange,
      surface: cardDark,
    ),
    textTheme: GoogleFonts.sairaTextTheme(ThemeData.dark().textTheme).copyWith(
      titleLarge: GoogleFonts.saira(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: textPrimaryDark,
      ),
      titleMedium: GoogleFonts.saira(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textPrimaryDark,
      ),
      bodyLarge: GoogleFonts.saira(
        fontSize: 15,
        color: textPrimaryDark,
      ),
      bodyMedium: GoogleFonts.saira(
        fontSize: 13,
        color: textSecondaryDark,
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: cardDark,
      elevation: 0,
      iconTheme: const IconThemeData(color: textPrimaryDark),
      titleTextStyle: GoogleFonts.saira(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: textPrimaryDark,
      ),
    ),
    cardTheme: CardThemeData(
      color: cardDark,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: borderDark, width: 1),
      ),
    ),
  );
}
