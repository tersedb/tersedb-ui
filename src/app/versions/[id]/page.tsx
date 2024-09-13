"use client";

import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import {useState, useEffect, useContext} from "react";

export default function Version({
  params: { id: v }
}: {
  params: { id: string }
}) {
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [s, setS] = useState(null);
  const [e, setE] = useState(null);
  const [forceRepaint, setForceRepaint] = useState(false);
  
  useEffect(() => {
    async function get() {
      try {
        const res = await act(settings, {
          r: {v: {e: v}}
        }, {
          401: () => addUnauthorized(`Couldn't Get Parent Of ${v}`),
        });
        const e = res.r.e[0];
        setE(e);
        const res_ = await act(settings, {
          r: {e: {s: e}}
        }, {
          401: () => addUnauthorized(`Couldn't Get Parent Of ${e}`)    
        });
        setS(res_.r.s[0]);
      } catch(e) {
        console.warn("Couldn't get parent", e);
      }
    }
    if (settings.actors.length > 0) {
      get();
    }
  }, [settings, e, forceRepaint]);

  if (!s || !e) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <div className="breadcrumbs text-sm">
        <ul>
          <li><a href="/spaces">Spaces</a></li>
          <li><a href={`/spaces/${s}`}>{s}</a></li>
          <li><a href={`/entities/${e}`}>{e}</a></li>
          <li>{v}</li>
        </ul>
      </div>
    </>
  );
}
