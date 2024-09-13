"use client";

import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import {useState, useEffect, useContext} from "react";

export default function Actors() {
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [actors, setActors] = useState<string[] | null>(null);
  const [forceRepaint, setForceRepaint] = useState(false);

  useEffect(() => {
    async function getActors() {
      try {
        const res = await act(settings, {
          r: "a"
        }, {
          401: () => addUnauthorized("Couldn't Read Actors"),
        });
        setActors(res.r.a);
      } catch(e) {
        console.warn("Couldn't get actors", e);
      }
    }
    if (settings.actors.length > 0) {
      getActors();
    }
  }, [settings, forceRepaint]);

  if (!actors) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  function createActor() {
    async function go() {
      try {
        const res = await act(settings, {
          c: "a"
        }, {
          401: () => addUnauthorized("Couldn't Create Actor"),
        });
        setForceRepaint(!forceRepaint);
      } catch(e) {
        console.warn("Couldn't create actor", e);
      }
    }
    go();
  }

  return (
    <>
      <h2 className="font-bold text-xl">Actors</h2>
      <div className="flex flex-row-reverse w-full">
        <button className="btn btn-primary" onClick={createActor}>Create Actor</button>
      </div>
      <ul className="menu rounded-box">
        {actors.map((a) => (
          <li key={a}><a href={`/actors/${a}`}>{a}</a></li>
        ))}
      </ul>
    </>
  );
}
