"use client";

import TabBar from "./components/TabBar";
import Settings from "./components/Settings";
import {SettingsContext, initSettings} from "./components/SettingsContext";
import {useState} from "react";

export default function RootTemplate({ children }) {
  const [settings, setSettings] = useState(initSettings);

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3">
        <TabBar />
        <SettingsContext.Provider value={settings}>
          { children }
        </SettingsContext.Provider>
      </div>
      <div id="settings" className="border-l-2 pl-2 h-screen">
        <Settings
          {...settings}
          onChange={(newSettings) => {setSettings(newSettings)}}
          />
      </div>
    </div>
  );
}
