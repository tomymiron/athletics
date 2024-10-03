import { Platform } from "react-native";
import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";

let isAdLoading = false;

export const AdComponent01 = () => {
  if (isAdLoading) return;

  const interstitial = InterstitialAd.createForAdRequest(Platform.OS == "ios" ? "ca-app-pub-3405311126818992/8004846705" : "ca-app-pub-3405311126818992/1048793795");

  isAdLoading = true;

  const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    console.log("Interstitial ad loaded");

    interstitial.show().then(() => {
      console.log("Interstitial ad shown");
      isAdLoading = false;
    }).catch((error) => {
      isAdLoading = false;
    });
  });

  const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => { isAdLoading = false; });
  interstitial.load();

  return () => {
    unsubscribeLoaded();
    unsubscribeError();
  };
};

let isAdLoadingAsync = false;

export const AdComponent01Async = async () => {
  if (isAdLoadingAsync) return;

  const interstitial = InterstitialAd.createForAdRequest(Platform.OS == "ios" ? "ca-app-pub-3405311126818992/8004846705" : "ca-app-pub-3405311126818992/1048793795");

  isAdLoadingAsync = true;

  try {
    // Esperar a que el anuncio se cargue
    const adLoadedPromise = new Promise((resolve, reject) => {
      const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        console.log("Interstitial ad loaded");
        resolve(); // Resuelve cuando el anuncio está cargado
      });

      const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error("Error loading ad:", error);
        reject(error); // Rechaza si ocurre un error
      });
      interstitial.load();

      // Retorno para eliminar los listeners después
      return () => {
        unsubscribeLoaded();
        unsubscribeError();
      };
    });

    // Esperar a que el anuncio esté completamente cargado
    await adLoadedPromise;

    // Mostrar el anuncio
    await interstitial.show();
    console.log("Interstitial ad shown");
  } catch (error) {
    console.error("Failed to show interstitial ad:", error);
  } finally {
    isAdLoadingAsync = false; // Asegurarse de que el estado vuelva a `false` siempre
  }
};
