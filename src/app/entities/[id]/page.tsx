"use client";

import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import TextSelect from "@/app/components/TextSelect";
import {useState, useEffect, useContext, useRef} from "react";

export default function Entity({ params: { id: e } }) {
  const [parent, setParent] = useState(null);
  const [allSpaces, setAllSpaces] = useState(null);
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [forceRepaint, setForceRepaint] = useState(false);
  const modalRef = useRef(null);
  const [selectedParent, setSelectedParent] = useState(null);
  
  useEffect(() => {
    async function getParent() {
      try {
        const res = await act(settings, {
          r: {e: {s: e}}
        }, {
          401: () => addUnauthorized(`Couldn't Get Parent Of ${e}`),
        });
        setParent(res.r.s[0]); 
      } catch(e) {
        console.warn("Couldn't get parent", e);
      }
    }
    async function getAllSpaces() {
      try {
        const res = await act(settings, {
          r: "s"
        }, {
          401: () => addUnauthorized("Couldn't Read Spaces"),
        });
        setAllSpaces(res.r.s); 
      } catch(e) {
        console.warn("Couldn't read spaces", e);
      }
    }
    if (settings.actors.length > 0) {
      getParent();
      getAllSpaces();
    }
  }, [settings, e, forceRepaint]);

  if (settings.actors.length === 0 || !parent || !allSpaces) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const possibleParents = allSpaces.filter((s) => parent !== s);

  function onCloseModal() {
    setSelectedParent(null);
  }

  function changeParent(s) {
    async function go() {
      try {
        const res = await act(settings, {
          u: {e: {e, s}}
        }, {
          401: () => addUnauthorized(`Couldn't Move Entity ${e} To ${s}`),
        });
        setForceRepaint(!forceRepaint);
      } catch(e) {
        console.warn("Couldn't set entity parent", e);
      }
      onCloseModal();
    }
    go();
  }

  return (
    <>
      <div className="breadcrumbs text-sm">
        <ul>
          <li><a href="/spaces">Spaces</a></li>
          <li><a href={`/spaces/${parent}`}>{parent}</a></li>
          <li>{e}</li>
        </ul>
      </div>
      <button
        onClick={() => modalRef.current.showModal()}
        className="btn btn-secondary">
        Move To Different Space
      </button>
      <dialog className="modal" ref={modalRef} onClose={onCloseModal}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{`Set Parent For ${e}`}</h3>
          <TextSelect
            label="SpaceId"
            placeholder={"s_1234..."}
            options={possibleParents}
            onSelect={setSelectedParent} />
          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn btn-primary mr-2"
                disabled={!selectedParent}
                onClick={(e) => {
                  e.preventDefault();
                  changeParent(selectedParent);
                }}>
                Save
              </button>
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </>
  );
}
