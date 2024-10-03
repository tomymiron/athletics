import "dotenv/config";

export default {
  expo: {
    name: "Athletics Labs",
    slug: "athletics",
    version: "1.2.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "cover",
      "backgroundColor": "#3AD8EF"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tomymiron.athletics",
    },
    "android": {
      "softwareKeyboardLayoutMode": "pan",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3AD8EF"
      },
      "package": "com.tomymiron.athletics"
    },
    web: {
      "favicon": "./assets/favicon.png"
    }, 
    extra: {
      "eas": {
        "projectId": "f4358d4e-237b-457b-9ead-6cdf113fc18a"
      }
    },
    env: {
      api_url: process.env.API_URL,
      apple_ads_token: process.env.APPLE_ADS_TOKEN,
    },
    plugins: [
      ["expo-build-properties", { "ios": { "useFrameworks": "static" }}],
      ["react-native-google-mobile-ads", { "iosAppId": "ca-app-pub-3405311126818992~3325664858", "androidAppId": "ca-app-pub-3405311126818992~8463215548", "userTrackingUsageDescription": "This identifier will be used to deliver personalized ads to you."}],
      ["expo-tracking-transparency", { "userTrackingPermission": "This identifier will be used to deliver personalized ads to you." }]
    ]
  }
}
