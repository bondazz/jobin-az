import SwiftUI

@main
struct JoobleApp: App {
    var body: some Scene {
        WindowGroup {
            MainContentView()
                .preferredColorScheme(.dark)
        }
    }
}

struct MainContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            NativeHomeScreenView()
                .tabItem {
                    Label("Vakansiyalar", systemImage: "briefcase.fill")
                }
                .tag(0)

            NativeCompaniesView()
                .tabItem {
                    Label("Şirkətlər", systemImage: "building.2.fill")
                }
                .tag(1)

            NativeFavoritesView()
                .tabItem {
                    Label("Saxlanılanlar", systemImage: "heart.fill")
                }
                .tag(2)
        }
        .accentColor(Color(red: 0.88, green: 0.33, blue: 0.16))
    }
}

struct NativeHomeScreenView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("100% Pure Native Swift Job Listing")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding()
                Spacer()
            }
            .navigationTitle("Jooble - Vakansiyalar")
        }
    }
}

struct NativeCompaniesView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("100% Pure Native Swift Companies Listing")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding()
                Spacer()
            }
            .navigationTitle("Şirkətlər")
        }
    }
}

struct NativeFavoritesView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("100% Pure Native Swift Favorites")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding()
                Spacer()
            }
            .navigationTitle("Saxlanılanlar")
        }
    }
}
