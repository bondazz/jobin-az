package az.jooble.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val OrangePrimary = Color(0xFFE05328)
val DarkBackground = Color(0xFF0F172A)
val DarkCard = Color(0xFF1E293B)
val LightBackground = Color(0xFFF8FAFC)

private val DarkColorScheme = darkColorScheme(
    primary = OrangePrimary,
    background = DarkBackground,
    surface = DarkCard,
    onPrimary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = OrangePrimary,
    background = LightBackground,
    surface = Color.White,
    onPrimary = Color.White,
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A)
)

@Composable
fun JoobleTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
