import {createContext} from "react";

export type Settings = {
  actors: string[],
  host: string,
  strict: boolean,
}

export const initSettings: Settings = {
  actors: [],
  host: "http://localhost:8000",
  strict: false,
};

export const SettingsContext = createContext(initSettings)

export async function act(
  settings: Settings,
  body: any,
  onStatus?: {[key: number]: () => void},
) {
  const uri = settings.host + (settings.strict ? "/actStrict" : "/act");
  const actors = settings.actors.join(",");
  try {
    const httpResponse = await fetch(uri, {
      cache: "no-store",
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Authorization": actors,
      }
    });

    if (onStatus && httpResponse.status !== 200 && onStatus[httpResponse.status]) {
      onStatus[httpResponse.status]();
    }

    const response = await httpResponse.json();

    return response;
  } catch(e) {
    console.warn("Error using `act`", e);
    return null;
  }
}
