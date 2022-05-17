import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { storage } from "@/lib/storage";

interface SettingsContextValue {
  setTheme: (theme: Settings["theme"]) => void;
  theme: Settings["theme"];
}

const SettingsContext = createContext<SettingsContextValue>(
  {} as SettingsContextValue
);

interface Settings {
  theme: "light" | "dark";
}

const defaultSettings: Settings = {
  theme: "light",
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Get initial settings from local storage
  useEffect(() => {
    const loadedSettings = storage.get<Settings>("settings", defaultSettings);
    setSettings(loadedSettings);
  }, []);

  // Save settings when they change
  useEffect(() => {
    saveSettings();
  }, [settings]);
  const saveSettings = () => storage.save<Settings>("settings", settings);

  const setTheme = (theme: Settings["theme"]) => {
    console.log(`Received theme ${theme}`);
    setSettings((s) => ({
      ...s,
      theme,
    }));
    document.body.dataset.theme = theme;
  };
  const theme = settings.theme;

  return (
    <SettingsContext.Provider value={{ setTheme, theme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
