import { createContext, useCallback, useEffect, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  let screen = window.screen;
  const [screenWidth, setScreenWidth] = useState(screen.width);
  const [screenHeight, setScreenHeight] = useState(screen.height);
  const [vh, setVh] = useState(window.innerHeight);
  const [isPWA, setIsPWA] = useState(false);
  const [osType, setOsType] = useState(null);
  const [browserType, setBrowserType] = useState(null);

  const screenResize = useCallback(() => {
    setScreenWidth(screen.width);
    setScreenHeight(screen.height);
    setVh(window.innerHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen.width]);

  useEffect(() => {
    window.addEventListener("resize", screenResize);

    return () => {
      window.removeEventListener("resize", screenResize);
    };
  }, [screenResize]);

  const [isLoading, setIsloading] = useState(false);
  // const [userRole, SetUserRole] = useState(false);
  const handleLoading = (value) => {
    setIsloading(value);
  };

  const isMobile = screenWidth < 1270;
  const deviceType =
    screenWidth >= 1270 ? "desktop" : screenWidth >= 744 ? "mobile" : "mobile";

  // Enhanced browser detection, especially for iOS
  const detectBrowser = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // iOS specific detection - all browsers on iOS use WebKit/Safari
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      // iOS Chrome has CriOS in user agent
      if (/CriOS/.test(userAgent)) return "Chrome";

      // iOS Firefox has FxiOS in user agent
      if (/FxiOS/.test(userAgent)) return "Firefox";

      // iOS Edge has EdgiOS in user agent
      if (/EdgiOS/.test(userAgent)) return "Edge";

      // iOS Opera has OPiOS in user agent
      if (/OPiOS/.test(userAgent)) return "Opera";

      // Default iOS browser is Safari
      return "Safari";
    }

    // Non-iOS browser detection
    if (/OPR|Opera/.test(userAgent)) return "Opera";
    if (/Edg/.test(userAgent)) return "Edge";
    if (/Chrome/.test(userAgent)) return "Chrome";
    if (/Firefox/.test(userAgent)) return "Firefox";
    if (/Safari/.test(userAgent)) return "Safari";
    if (/Trident/.test(userAgent)) return "Internet Explorer";

    return "Unknown";
  };

  // Detect device information on mount
  useEffect(() => {
    // Detect if running as PWA
   
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");
    setIsPWA(isStandalone);

    // Detect OS
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // OS Detection - simplified
    let detectedOS = "Unknown";
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      detectedOS = "iOS";
    } else if (/Android/.test(userAgent)) {
      detectedOS = "Android";
    } else if (/Mac OS X/.test(userAgent)) {
      detectedOS = "macOS";
    } else if (/Windows/.test(userAgent)) {
      detectedOS = "Windows";
    } else if (/Linux/.test(userAgent)) {
      detectedOS = "Linux";
    }
    setOsType(detectedOS);

    // Use the enhanced browser detection
    setBrowserType(detectBrowser());

    console.log("Device detection:", {
      isPWA: isStandalone,
      osType: detectedOS,
      browserType: detectBrowser(),
      userAgent,
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        handleLoading,
        isMobile,
        screenWidth,
        screenHeight,
        deviceType,
        vh,
        isPWA,
        osType,
        browserType,
      }}
    >
      {isLoading && <LoadingPage />}
      {children}
    </AppContext.Provider>
  );
};
