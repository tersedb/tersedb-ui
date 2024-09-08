import SinglePermissionSelect from "./SinglePermissionSelect";
import CollectionPermissionSelect from "./CollectionPermissionSelect";
import TextSelect from "@/app/components/TextSelect";
import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import {useState, useContext, useEffect, useRef} from "react";

export default function MinorPermission({ g, pName, pLabel, pType, collection }) {
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [perms, setPerms] = useState(null);
  const [possibleIds, setPossibleIds] = useState([]);
  const modalRef = useRef(null);
  const [addedId, setAddedId] = useState(null);
  const [addedP, setAddedP] = useState(null);

  useEffect(() => {
    async function go() {
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
    if (settings.actors.length > 0) {
      go();
    }
  }, [settings, g, pName]);

  useEffect(() => {
    async function go() {
      try {
        const cName = pName === "e" ? "s" : pName === "m" ? "g" : pName;
        const res = await act(settings, {
          r: cName
        }, {
          401: () => addUnauthorized(`Couldn't Read All ${collection}`),
        });
        setPossibleIds(res.r[cName].filter((p) => !(perms.includes(p))));
      } catch(e) {
        console.warn("Couldn't get all ids", e);
      }
    }
    if (settings.actors.length > 0 && perms) {
      go();
    }
  }, [settings, g, pName, perms])

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
        {perms.map(([k, v]) => (
          <tr key={k}>
            <td>{k}</td>
            <td>
              {
                pType === "single"
                  ? (<SinglePermissionSelect permission={v} onChange={(p) => {}} />)
                  : (<CollectionPermissionSelect permission={v} onChange={(p) => {}} />)
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
  }

  function addP(e, { p, id }) {
    e.preventDefault();
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

  return (
    <>
      {currentSettings}
      <div className="flex flex-row-reverse w-full">
        <button
          onClick={() => modalRef.current.showModal()}
          className="btn btn-sm btn-accent">
          +
        </button>
      </div>
      <dialog className="modal" ref={modalRef} onClose={onCloseModal}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{`Add ${collection} Permission`}</h3>
          <TextSelect
            label={pLabel}
            placeholder={`${pName}_1234...`}
            options={possibleIds}
            onSelect={setAddedId} />
          {
            pType === "single"
              ? (<SinglePermissionSelect permission={addedP} onChange={setAddedP} />)
              : (<CollectionPermissionSelect permission={addedP} onChange={setAddedP} />)
          }
          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn btn-primary mr-2"
                onClick={(e) => addP(e, { p: addedP, id: addedId })}>
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

