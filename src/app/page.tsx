"use client";

import {useContext, useState, useEffect, useRef} from "react";
import {SettingsContext, act} from "./components/SettingsContext";

export default function Groups() {
  const settings = useContext(SettingsContext);
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
    go();
  }, [settings, forceRepaint])

  if (groups === null) {
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
      });
      console.log(res);
      setForceRepaint(!forceRepaint);
    }
    go();
  }

  function renderNode({g, next}) {
    return (
      <div className="flex flex-col gap-4" key={g}>
        <button
          onClick={() => {
            setGroupDetailsOf(g);
            groupDetailsModal.current.showModal();
          }}
          className="btn btn-sm btn-secondary shrink align-center">
          ...{g.substring(g.length - 4, g.length)}
        </button>
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
      <dialog id="group-details" className="modal" ref={groupDetailsModal}>
        <div className="modal-box">
          <h3 className="font-bold mb-2 text-lg">Group Details</h3>
          {
            groupDetailsOf ? (<GroupDetails g={groupDetailsOf} />) : (<></>)
          }
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}

function GroupDetails({g}) {
  const [members, setMembers] = useState(null);
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState(null);
  const settings = useContext(SettingsContext);

  useEffect(() => {
    async function getMembers() {
      const res = await act(settings, {
        r: {m: g}
      });
      setMembers(res.r.a);
    }
    getMembers();
  }, [g])

  const viewMembers = members && (
    <ul className="menu rounded-box">
      {members.map((a) => (<li><a>{a}</a></li>))}
    </ul>
  );

  return (
    <>
      <span>{g}</span>
      <h4 className="font-bold mt-2">Members</h4>
      {members && members.length > 0 ? viewMembers : "none"}
      <h4 className="font-bold">Parent Group</h4>
      {parent && parent.length > 0 ? parent[0] : "no parent"}
      <h4 className="font-bold">Child Groups</h4>
      {children && children.length > 0 ? children : "none"}
    </>
  );
}
