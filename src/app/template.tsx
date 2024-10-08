"use client";

import TabBar from "./components/TabBar";
import Settings from "./components/Settings";
import {SettingsContext, initSettings} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import {useState, useEffect} from "react";

export default function RootTemplate({
  children
}: {
  children: React.ReactNode,
}) {
  const [settings, setSettings] = useState(initSettings);
  const [unauthorizedNotices, setUnauthorizedNotices] = useState<string[]>([]);
  function addUnauthorized(notice: string) {
    setUnauthorizedNotices([ ...unauthorizedNotices, notice ]);
  }

  useEffect(() => {
    try {
      const settingsString = localStorage.getItem("settings");
      if (settingsString) {
        const storedSettings = JSON.parse(settingsString);
        if (storedSettings) {
          setSettings(storedSettings);
        }
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
          <UnauthorizedContext.Provider value={addUnauthorized}>
            { children }
          </UnauthorizedContext.Provider>
        </SettingsContext.Provider>
      </div>
      <div id="settings" className="border-l-2 pl-2 shrink">
        <Settings
          {...settings}
          unauthorized={unauthorizedNotices}
          rmUnauthorized={(idx) => setUnauthorizedNotices(
            unauthorizedNotices.filter((_,idx_) => idx !== idx_)
          )}
          onChange={(newSettings) => {
            localStorage.setItem("settings", JSON.stringify(newSettings));
            setSettings(newSettings)
          }}
          />
      </div>
    </div>
  );
}
