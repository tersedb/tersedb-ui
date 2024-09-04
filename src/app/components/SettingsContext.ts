import {createContext} from "react";

export const initSettings = {
  actors: [],
  host: "http://localhost:8000",
  strict: false,
};

export const SettingsContext = createContext(initSettings)
