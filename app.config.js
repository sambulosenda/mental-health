export default {
  expo: {
    name: "Softmind",
    slug: "softmind",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "softmind",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sambulosendas1.softmind",
      infoPlist: {
        NSSpeechRecognitionUsageDescription:
          "Softmind uses speech recognition to transcribe your voice journal entries.",
        NSMicrophoneUsageDescription:
          "Softmind needs microphone access to record your voice for journaling.",
        NSPhotoLibraryUsageDescription:
          "Softmind may access your photo library to save or share content.",
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.sambulosendas1.softmind",
      permissions: ["android.permission.RECORD_AUDIO"],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    updates: {
      url: "https://u.expo.dev/b7a89065-39ec-4a55-9e5d-af703806e0f5",
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 30000,
    },
    runtimeVersion: "1.0.0",
    plugins: [
      ["expo-dev-client", { launchMode: "most-recent" }],
      "expo-router",
      "@react-native-voice/voice",
      ["react-native-bootsplash", { assetsDir: "assets/bootsplash" }],
      "expo-sqlite",
      "expo-secure-store",
      ["expo-updates", { username: "sambulosendas1" }],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      groqApiKey: process.env.GROQ_API_KEY,
      revenueCatApiKeyIOS: process.env.REVENUECAT_API_KEY_IOS,
      revenueCatApiKeyAndroid: process.env.REVENUECAT_API_KEY_ANDROID,
      router: {},
      eas: {
        projectId: "b7a89065-39ec-4a55-9e5d-af703806e0f5",
      },
    },
    owner: "sambulosendas1",
  },
};
