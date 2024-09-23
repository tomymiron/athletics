import "dotenv/config";

export default {
  expo: {
    name: "athletics",
    slug: "athletics",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "cover",
      "backgroundColor": "#171921"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tomymiron.athletics"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#171921"
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
    },
  }
}
