package az.jooble.app.ui.screens

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import az.jooble.app.ui.theme.OrangePrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppNavigation() {
    var selectedTab by remember { mutableStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Text("💼") },
                    label = { Text("Vakansiyalar") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = OrangePrimary,
                        selectedTextColor = OrangePrimary
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Text("🏢") },
                    label = { Text("Şirkətlər") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = OrangePrimary,
                        selectedTextColor = OrangePrimary
                    )
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Text("❤️") },
                    label = { Text("Saxlanılanlar") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = OrangePrimary,
                        selectedTextColor = OrangePrimary
                    )
                )
            }
        }
    ) { innerPadding ->
        Surface(
            modifier = Modifier.padding(innerPadding)
        ) {
            when (selectedTab) {
                0 -> NativeHomeScreen()
                1 -> NativeCompaniesScreen()
                2 -> NativeFavoritesScreen()
            }
        }
    }
}

@Composable
fun NativeHomeScreen() {
    Text(
        text = "100% Pure Native Kotlin Job Listing",
        modifier = Modifier.padding(16.dp),
        style = MaterialTheme.typography.headlineMedium
    )
}

@Composable
fun NativeCompaniesScreen() {
    Text(
        text = "100% Pure Native Kotlin Companies Listing",
        modifier = Modifier.padding(16.dp),
        style = MaterialTheme.typography.headlineMedium
    )
}

@Composable
fun NativeFavoritesScreen() {
    Text(
        text = "100% Pure Native Kotlin Favorites",
        modifier = Modifier.padding(16.dp),
        style = MaterialTheme.typography.headlineMedium
    )
}
