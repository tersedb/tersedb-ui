"use client";

import {useContext, useState, useEffect, useRef} from "react";
import {SettingsContext, act} from "./components/SettingsContext";
import {UnauthorizedContext} from "./components/UnauthorizedContext";

export default function Groups() {
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [forceRepaint, setForceRepaint] = useState(false);
  const [groups, setGroups] = useState(null);
  const groupDetailsModal = useRef(null);
  const [groupDetailsOf, setGroupDetailsOf] = useState(null);

  useEffect(() => {
    async function go() {
      async function getNext(gs) {
        let thunks = [];
        for (const g of gs) {
          thunks.push((async () => {
            const res = await act(settings, {
              r: {g: {n: g}}
            }, {
              401: () => addUnauthorized(`Couldn't Read Next Groups for ${g}`),
            });
            const next = res ? await getNext(res.r.g) : [];
            return {g, next};
          })());
        }
        const gsWithNext = await Promise.all(thunks);
        return gsWithNext;
      }

      try {
        const res = await act(settings, {
          r: "rg"
        }, {
          401: () => addUnauthorized("Couldn't Read All Root Groups"),
        });
        const groups = await getNext(res.r.g);
        // const res = await act(settings, {
        //   r: "g"
        // });
        // const groups = res.r.g;
        setGroups(groups); 
      } catch(e) {
        console.warn("Couldn't set response", e);
      }
    }
    if (settings.actors.length > 0) {
      go();
    }
  }, [settings, forceRepaint])

  if (settings.actors.length === 0 || groups === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  function createGroup() {
    async function go() {
      const res = await act(settings, {
        c: "g"
      }, {
        401: addUnauthorized("Couldn't Create Group"),
      });
      console.log(res);
      setForceRepaint(!forceRepaint);
    }
    go();
  }

  function renderNode({g, next}) {
    return (
      <div className="flex flex-col gap-4" key={g}>
        <a
          href={`/${g}`}
          className="btn btn-sm btn-secondary shrink align-center">
          {g.substring(0, 6)}...
        </a>
        <div className="flex flex-row gap-4">
          {next.map(renderNode)}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col">
        <button
          onClick={createGroup}
          className="btn btn-primary shrink self-end">
          Create Group
        </button>
        <div className="flex flex-row gap-4">
          {groups.map(renderNode)}
        </div>
      </div>
    </>
  );
}
