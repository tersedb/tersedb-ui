"use client";

import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import {useState, useEffect, useContext} from "react";

export default function Space({ params: { id: s}}) {
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [entities, setEntities] = useState(null);
  const [forceRepaint, setForceRepaint] = useState(false);

  useEffect(() => {
    async function getEntities() {
      try {
        const res = await act(settings, {
          r: {e: s}
        }, {
          401: () => {
            addUnauthorized(`Couldn't Read Entities For ${s}`);
            setEntities(undefined);
          },
        });
        if (res.r.e) {
          setEntities(res.r.e);
        }
      } catch(e) {
        console.warn("Couldn't get entities", e);
      }
    }
    if (settings.actors.length > 0) {
      getEntities();
    }
  }, [settings, s, forceRepaint]);

  if (settings.actors.length === 0 || entities === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  function createEntity() {
    async function go() {
      try {
        const res = await act(settings, {
          c: {e: {s, f: null}}
        }, {
          401: () => addUnauthorized(`Couldn't Create Entity For ${s}`),
        });
        setForceRepaint(!forceRepaint);
      } catch(e) {
        console.warn("Couldn't create entity", e);
      }
    }
    go();
  }

  const viewEntities = entities && (
    <ul className="menu rounded-box">
      {entities.map((e) => (
        <li key={e} className="flex flex-row">
          <a href={`/entities/${e}`} className="grow">{e}</a>
          <button className="btn btn-sm btn-error">-</button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <div className="breadcrumbs text-sm">
        <ul>
          <li><a href="/spaces">Spaces</a></li>
          <li>{s}</li>
        </ul>
      </div>
      <h3 className="font-bold text-lg">Entities</h3>
      <div className="flex flex-row-reverse w-full">
        <button className="btn btn-primary" onClick={createEntity}>Create Entity</button>
      </div>
      {entities === undefined ? "Unauthorized" : entities.length === 0 ? "none" : viewEntities}
    </>
  );
}
