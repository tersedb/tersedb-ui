"use client";

import TabBar from "./components/TabBar";
import Settings from "./components/Settings";
import {SettingsContext, initSettings} from "./components/SettingsContext";
import {useState, useEffect} from "react";

export default function RootTemplate({ children }) {
  const [settings, setSettings] = useState(initSettings);
  useEffect(() => {
    try {
      const storedSettings = JSON.parse(localStorage.getItem("settings"));
      if (storedSettings) {
        setSettings(storedSettings);
      }
    } catch(e) {
      console.warn("Failed to parse locally stored settings", e);
    }
  }, []);

  return (
    <div className="flex flex-row gap-4">
      <div className="grow">
        <TabBar />
        <SettingsContext.Provider value={settings}>
          { children }
        </SettingsContext.Provider>
      </div>
      <div id="settings" className="border-l-2 pl-2 h-screen shrink">
        <Settings
          {...settings}
          onChange={(newSettings) => {
            localStorage.setItem("settings", JSON.stringify(newSettings));
            setSettings(newSettings)
          }}
          />
      </div>
    </div>
  );
}
