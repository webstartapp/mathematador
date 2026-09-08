import { AudioSource } from "expo-audio";
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Platform } from "react-native";

import {
  createMenuMusicEngine,
  MenuMusicEngine,
} from "@/providers/audio/menuMusicEngine";

// Browsers block audio autoplay until the page has seen a user gesture, so a
// bare play() call is silently ignored on a cold load. Retrying on the first
// interaction (any click/tap/keypress) is the standard workaround.
const FIRST_INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart"];

interface MenuMusicContextValue {
  requestTrack: (source: AudioSource | null) => void;
}

const MenuMusicContext = createContext<MenuMusicContextValue>({
  requestTrack: () => {},
});

export const useMenuMusicContext = (): MenuMusicContextValue =>
  useContext(MenuMusicContext);

interface MenuMusicProviderProps {
  children: ReactNode;
}

const MenuMusicProvider: FC<MenuMusicProviderProps> = ({ children }) => {
  const engineRef = useRef<MenuMusicEngine | null>(null);

  const getEngine = useCallback((): MenuMusicEngine => {
    if (!engineRef.current) {
      engineRef.current = createMenuMusicEngine();
    }
    return engineRef.current;
  }, []);

  const requestTrack = useCallback(
    (source: AudioSource | null): void => {
      getEngine().requestTrack(source);
    },
    [getEngine],
  );

  useEffect(() => {
    if (Platform.OS !== "web") return () => {};

    const retryOnInteraction = (): void => {
      getEngine().retryPlaybackOnInteraction();
    };

    FIRST_INTERACTION_EVENTS.forEach((eventName) =>
      document.addEventListener(eventName, retryOnInteraction),
    );
    return () => {
      FIRST_INTERACTION_EVENTS.forEach((eventName) =>
        document.removeEventListener(eventName, retryOnInteraction),
      );
    };
  }, [getEngine]);

  useEffect(() => {
    return () => {
      engineRef.current?.teardown();
      engineRef.current = null;
    };
  }, []);

  return (
    <MenuMusicContext.Provider value={{ requestTrack }}>
      {children}
    </MenuMusicContext.Provider>
  );
};

export default MenuMusicProvider;
