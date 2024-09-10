"use client";

import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import TextSelect from "@/app/components/TextSelect";
import Modal from "@/app/components/Modal";
import {useState, useEffect, useContext, useRef} from "react";

export default function Entity({ params: { id: e } }) {
  const [parent, setParent] = useState(null);
  const [versions, setVersions] = useState(null);
  const [allSpaces, setAllSpaces] = useState(null);
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [forceRepaint, setForceRepaint] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
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
    async function getVersions() {
      try {
        const res = await act(settings, {
          r: {v: e}
        }, {
          401: () => addUnauthorized(`Couldn't Read Versions Of ${e}`)
        });
        setVersions(res.r.v);
      } catch(e) {
        console.warn("Couldn't read versions", e);
      }
    }
    if (settings.actors.length > 0) {
      getParent();
      getAllSpaces();
      getVersions();
    }
  }, [settings, e, forceRepaint]);

  if (settings.actors.length === 0 || !parent || !allSpaces || !versions) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const possibleParents = allSpaces.filter((s) => parent !== s);

  function onCloseModal() {
    setSelectedParent(null);
    setModalOpen(false);
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

  const viewVersions = (
    <ol className="menu rounded-box flex flex-col-reverse list-decimal ml-4">
      {versions.slice().reverse().map((v) => (
        <li key={v} className="list-item"><a href={`/versions/${v}`}>{v}</a></li>
      ))}
    </ol>
  );

  function createVersion() {
    async function go() {
      try {
        const res = await act(settings, {
          c: {v: e}
        }, {
          401: () => addUnauthorized(`Couldn't Create Version For ${e}`),
        });
        setForceRepaint(!forceRepaint);
      } catch(e) {
        console.warn("Couldn't Create Version", e);
      }
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
        onClick={() => setModalOpen(true)}
        className="btn btn-secondary">
        Move To Different Space
      </button>
      <Modal
        onSubmit={() => changeParent(selectedParent)}
        submitLabel="Save"
        submitDisabled={!selectedParent}
        onCloseModal={onCloseModal}
        open={modalOpen}>
        <h3 className="font-bold text-lg">{`Set Parent For ${e}`}</h3>
        <TextSelect
          label="SpaceId"
          placeholder={"s_1234..."}
          options={possibleParents}
          onSelect={setSelectedParent} />
      </Modal>
      <h3 className="font-bold text-lg">Versions</h3>
      <div className="flex flex-row-reverse">
        <button
          onClick={createVersion}
          className="btn btn-primary">
          Create New Version
        </button>
      </div>
      {versions.length > 0 ? viewVersions : "none"}
    </>
  );
}
