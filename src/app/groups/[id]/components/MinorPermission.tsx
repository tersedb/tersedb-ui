import SinglePermissionSelect from "./SinglePermissionSelect";
import CollectionPermissionSelect from "./CollectionPermissionSelect";
import TextSelect from "@/app/components/TextSelect";
import Modal from "@/app/components/Modal";
import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import {useState, useContext, useEffect, useRef} from "react";

export default function MinorPermission({ g, pName, pLabel, pType, collection }) {
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [perms, setPerms] = useState(null);
  const [allIds, setAllIds] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [addedP, setAddedP] = useState(null);
  const cName = pName === "e" ? "s" : pName === "m" ? "g" : pName;
  const [forceRepaint, setForceRepaint] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function getPerms() {
      try {
        const res = await act(settings, {
          r: {p: {[pName]: g}}
        }, {
          401: () => addUnauthorized(`Couldn't Read ${pLabel} Permissions for ${g}`),
        });
        setPerms(res.r.ps[pName]);
      } catch(e) {
        console.warn("Couln't get perms", e);
      }
    }
    async function getIds() {
      try {
        const res = await act(settings, {
          r: cName
        }, {
          401: () => addUnauthorized(`Couldn't Read All ${collection}`),
        });
        setAllIds(res.r[cName]);
      } catch(e) {
        console.warn("Couldn't get all ids", e);
      }
    }
    if (settings.actors.length > 0) {
      getPerms();
      getIds();
    }
  }, [settings, g, pName, forceRepaint]);

  if (!allIds || !perms) {
    return (
      <div className="w-full flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const possibleIds = allIds.filter((p) => !(perms.includes(p)));

  function addP({ p, id }) {
    async function go() {
      try {
        const res = await act(settings, {
          u: {p: {[pName]: {g, p, s: id}}}
        }, {
          401: () => addUnauthorized(`Couldn't set Permission Over ${id} For ${g}`),
        });
        setForceRepaint(!forceRepaint);
      } catch(e) {
        console.warn("Couldn't save collection permission", e);
      }
      modalRef.current.close();
    }
    go();
  }

  const currentSettings = perms && (
    <table className="table">
      <thead>
        <tr>
          <th>{pLabel}</th>
          <th>Permission</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {perms.map(([id, p]) => (
          <tr key={id}>
            <td>{id}</td>
            <td>
              {
                pType === "single"
                  ? (<SinglePermissionSelect permission={p} onChange={(p) => {}} />)
                  : (<CollectionPermissionSelect
                        permission={p}
                        onChange={(p) => addP({p, id})} />)
              }
            </td>
            <td>
              <button
                onClick={() => {}}
                className="btn btn-sm btn-error">
                -
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  function onCloseModal() {
    setAddedP(null);
    setAddedId(null);
    setModalOpen(false);
  }

  return (
    <>
      {currentSettings}
      <div className="flex flex-row-reverse w-full">
        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-sm btn-accent">
          +
        </button>
      </div>
      <Modal
        onSubmit={() => addP({ p: addedP, id: addedId })}
        submitLabel="Save"
        submitDisabled={!addedP || !addedId}
        onCloseModal={onCloseModal}
        open={modalOpen}>
        <h3 className="font-bold text-lg">{`Add ${collection} Permission`}</h3>
        <TextSelect
          label={pLabel}
          placeholder={`${cName}_1234...`}
          options={possibleIds}
          onSelect={setAddedId} />
        {
          pType === "single"
            ? (<SinglePermissionSelect permission={addedP} onChange={setAddedP} />)
            : (<CollectionPermissionSelect permission={addedP} onChange={setAddedP} />)
        }
      </Modal>
    </>
  );
}

