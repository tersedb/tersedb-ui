"use client";

import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import {useState, useEffect, useContext} from "react";

export default function Spaces() {
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [spaces, setSpaces] = useState<string[] | null>(null);
  const [forceRepaint, setForceRepaint] = useState(false);

  useEffect(() => {
    async function getSpaces() {
      try {
        const res = await act(settings, {
          r: "s"
        }, {
          401: () => addUnauthorized("Couldn't Read Spaces"),
        });
        setSpaces(res.r.s);
      } catch(e) {
        console.warn("Couldn't get spaces", e);
      }
    }
    if (settings.actors.length > 0) {
      getSpaces();
    }
  }, [settings, forceRepaint]);

  if (!spaces) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  function createSpace() {
    async function go() {
      try {
        const res = await act(settings, {
          c: "s"
        }, {
          401: () => addUnauthorized("Couldn't Create Space"),
        });
        setForceRepaint(!forceRepaint);
      } catch(e) {
        console.warn("Couldn't create space", e);
      }
    }
    go();
  }

  const viewSpaces = (
    <ul className="menu rounded-box">
      {spaces.map((s) => (
        <li key={s} className="flex flex-row">
          <a href={`/spaces/${s}`} className="grow">{s}</a>
          <button className="btn btn-sm btn-error">-</button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <h2 className="font-bold text-xl">Spaces</h2>
      <div className="flex flex-row-reverse w-full">
        <button className="btn btn-primary" onClick={createSpace}>Create Space</button>
      </div>
      {spaces === null ? "none" : viewSpaces}
    </>
  );
}
