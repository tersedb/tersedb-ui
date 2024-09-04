import {createContext} from "react";

export const initSettings = {
  actors: [],
  host: "http://localhost:8000",
  strict: false,
};

export const SettingsContext = createContext(initSettings)

export async function act(settings, body) {
  const uri = settings.host + (settings.strict ? "/actStrict" : "/act");
  const actors = settings.actors.map(({actor}) => actor).join(",");
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
    const response = await httpResponse.json();

    return response;
  } catch(e) {
    console.warn("Error using `act`", e);
    return null;
  }
}
