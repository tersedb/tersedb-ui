"use client";

import {SettingsContext, act} from "../components/SettingsContext";
import {UnauthorizedContext} from "../components/UnauthorizedContext";
import TextSelect from "../components/TextSelect";
import {useState, useContext, useEffect, useRef} from "react";

export default function Group({ params: { id: g }}) {
  const [forceRepaint, setForceRepaint] = useState(false);
  const [members, setMembers] = useState(null);
  const [possibleMembers, setPossibleMembers] = useState([]);
  const [parent, setParent] = useState(null);
  const [possibleParents, setPossibleParents] = useState([]);
  const [children, setChildren] = useState(null);
  const [possibleChildren, setPossibleChildren] = useState([]);
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);

  useEffect(() => {
    async function getMembers() {
      try {
        const res = await act(settings, {
          r: {m: g}
        }, {
          401: () => addUnauthorized(`Read Group Members of ${g}`),
        });
        setMembers(res.r.a);
      } catch(e) {
        console.warn("Couldn't act", e);
      }
    }
    async function getParent() {
      try {
        const res = await act(settings, {
          r: {g: {p: g}}
        }, {
          401: () => addUnauthorized(`Read Parent of ${g}`),
        });
        setParent(res.r.g);
      } catch(e) {
        console.warn("Couldn't act", e);
      }
    }
    async function getChildren() {
      try {
        const res = await act(settings, {
          r: {g: {n: g}}
        }, {
          401: () => addUnauthorized(`Read Children of ${g}`),
        });
        setChildren(res.r.g);
      } catch(e) {
        console.warn("Couldn't act", e);
      }
    }
    if (settings.actors.length > 0) {
      getMembers();
      getParent();
      getChildren();
    }
  }, [settings, g])

  useEffect(() => {
    async function getPossibleMembers() {
      try {
        const res = await act(settings, {
          r: "a"
        }, {
          401: () => addUnauthorized(`Read All Actors Failed`),
        });
        setPossibleMembers(res.r.a.filter((a) => !(members.includes(a))));
      } catch(e) {
        console.warn("Couldn't act", e);
      }
    }
    if (settings.actors.length > 0 && members) {
      getPossibleMembers();
    }
  }, [settings, g, members]);

  useEffect(() => {
    async function getPossibleParents() {
      try {
        const res = await act(settings, {
          r: "g"
        }, {
          401: () => addUnauthorized(`Read All Groups Failed`),
        });
        setPossibleParents(res.r.g.filter((g) => !(children.includes(g)) && parent !== g));
      } catch(e) {
        console.warn("Couldn't act", e);
      }
    }
    if (settings.actors.length > 0 && children) {
      getPossibleParents();
    }
  }, [settings, g, parent, children]);

  useEffect(() => {
    async function getPossibleChildren() {
      try {
        const res = await act(settings, {
          r: "g"
        }, {
          401: () => addUnauthorized(`Read All Groups Failed`),
        });
        setPossibleChildren(res.r.g.filter((g) => !(children.includes(g)) && parent !== g));
      } catch(e) {
        console.warn("Couldn't act", e);
      }
    }
    if (settings.actors.length > 0 && children) {
      getPossibleChildren();
    }
  }, [settings, g, parent, children]);

  if (settings.actors.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const viewMembers = members && (
    <ul className="menu rounded-box">
      {members.map((a) => (
        <li key={a} className="flex flex-row w-full">
          <a className="grow">{a}</a>
          <button className="btn btn-sm btn-error">-</button>
        </li>
      ))}
    </ul>
  );

  const viewParent = parent && (
    <ul className="menu rounded-box">
      <li className="flex flex-row w-full">
        <a className="grow">{parent[0]}</a>
        <button className="btn btn-sm btn-error">-</button>
      </li>
    </ul>
  );

  function addMember(a) {
    async function go() {
      try {
        const res = await act(settings, {
          c: {m: {g, a}}
        }, {
          401: () => addUnauthorized(`Failed to Create Membership of ${a} to ${g}`),
        });
        setForceRepaint(!forceRepaint);
      } catch(e) {
        console.warn("Couldn't add member", e);
      }
    }
    go();
  }

  return (
    <>
      <div className="breadcrumbs text-sm">
        <ul>
          <li><a href="/">Groups</a></li>
          <li>{g}</li>
        </ul>
      </div>
      <h3 className="font-bold mt-2 text-lg">Group Structure</h3>
      <h4 className="font-bold">Members</h4>
      <TextSelect
        label="Add Member"
        placeholder="a_1234..."
        options={possibleMembers}
        onSelect={addMember} />
      {members && members.length > 0 ? viewMembers : "none"}
      <div className="divider"></div>
      <h4 className="font-bold">Parent Group</h4>
      <TextSelect
        label="Set Parent"
        placeholder="g_1234..."
        options={possibleParents}
        onSelect={() => {}} />
      {parent && parent.length > 0 ? viewParent : "no parent"}
      <div className="divider"></div>
      <h4 className="font-bold">Child Groups</h4>
      <TextSelect
        label="Add Child"
        placeholder="g_1234..."
        options={possibleChildren}
        onSelect={() => {}} />
      {children && children.length > 0 ? children : "none"}
      <div className="divider"></div>
      <h3 className="font-bold mt-2 text-lg">Set Permissions</h3>
      <h4 className="font-bold">Universe</h4>
      <MajorPermission g={g} pName="u" pLabel="Universe" />
      <h4 className="font-bold">Organization</h4>
      <MajorPermission g={g} pName="o" pLabel="Organization" />
      <h4 className="font-bold">Recruiter</h4>
      <MajorPermission g={g} pName="r" pLabel="Recruiter" />
      <h4 className="font-bold">Spaces</h4>
      <MinorPermission g={g} pName="s" pLabel="SpaceId" pType="single" collection="Space" />
      <h4 className="font-bold">Entities</h4>
      <MinorPermission g={g} pName="e" pLabel="SpaceId" pType="collection" collection="Entity" />
      <h4 className="font-bold">Groups</h4>
      <MinorPermission g={g} pName="g" pLabel="GroupId" pType="single" collection="Group" />
      <h4 className="font-bold">Members</h4>
      <MinorPermission g={g} pName="m" pLabel="GroupId" pType="collection" collection="Member" />
      <div className="divider"></div>
      <h3 className="font-bold mt-2 text-lg">Effective Permissions</h3>
      <EffectivePermissions g={g} />
    </>
  );
}

function MajorPermission({ g, pName, pLabel, s }) {
  const [permission, setPermission] = useState(null);
  const settings = useContext(SettingsContext);

  useEffect(() => {
    async function getPermission() {
      try {
        const res = await act(settings, {
          r: {[pName]: s ? {g,s} : g}
        });
        setPermission(res.r.p);
      } catch(e) {
        console.warn("Couldn't act", e);
      }
    }
    getPermission();
  }, [settings, g, pName])

  function onChange({e, p}) {
    async function go() {
      try {
        const newPermission = e ? { e, p } : p
        const res = await act(settings, {
          u: {"p": {[pName]: {g, "p": newPermission}}}
        }, {
          401: () => addUnauthorized(`Couldn't set ${pLabel} Permission For ${g}`)
        });
        setPermission(newPermission)
        setForceRepaint(!forceRepaint);
      } catch(e) {
        console.warn("Couldn't set", e);
      }
    }
    go();
  }

  if (pName === "u" || pName === "o") {
    return (
      <div className="flex flex-row">
        <CollectionPermissionSelect
          permission={permission && permission.p}
          onChange={(p) => onChange({...permission, p})} />
        <PermissionExempt
          exempt={permission && permission.e}
          onChange={(e) => onChange({...permission, e})} />
      </div>
    );
  } else {
    return (
      <CollectionPermissionSelect
        permission={permission}
        onChange={(p) => onChange({ p })} />
    );
  }
}

function MinorPermission({ g, pName, pLabel, pType, collection }) {
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



function CollectionPermissionSelect({ permission, onChange }) {
  let perms = [
    { p: "b", name: "Blind" },
    { p: "r", name: "Read" },
    { p: "c", name: "Create" },
    { p: "u", name: "Update" },
    { p: "d", name: "Delete" },
  ]
  return (
    <select
      className="select select-bordered grow w-full"
      value={permission || "default"}
      onChange={(e) => onChange(e.target.value)}>
      <option disabled value="default">Permission</option>
      {perms.map(({p,name}) => (
        <option key={p} value={p}>{name}</option>
      ))}
    </select>
  );
}

function PermissionExempt({ exempt, onChange }) {
  return (
    <label className="label">
      <span className="label-text mr-2">Exempt from Exclusion?</span>
      <input
        type="checkbox"
        className="toggle"
        checked={exempt}
        onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function SinglePermissionSelect({ permission, onChange }) {
  let perms = [
    { p: "n", name: "NonExistent" },
    { p: "e", name: "Exists" },
    { p: "a", name: "Adjust" },
    { p: "o", name: "Obliterate" },
  ]

  return (
    <select
      className="select select-bordered grow w-full"
      value={permission || "default"}
      onChange={(e) => onChange(e.target.value)}>
      <option disabled value="default">Permission</option>
      {perms.map(({p,name}) => (
        <option key={p} value={p}>{name}</option>
      ))}
    </select>
  );
}

function EffectivePermissions({ g }) {
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [u, setU] = useState(null);
  const [o, setO] = useState(null);
  const [r, setR] = useState(null);

  useEffect(() => {
    async function getU() {
      try {
        const res = await act(settings, {
          r: {t: {u: g}}
        }, {
          401: () => addUnauthorized(`Couldn't get Effective Universe Permission for ${g}`),
        });
        setU(res.r.p);
      } catch(e) {
        console.warn("Can't get tabulated permission", e);
      }
    }
    async function getO() {
      try {
        const res = await act(settings, {
          r: {t: {o: g}}
        }, {
          401: () => addUnauthorized(`Couldn't get Effective Organization Permission for ${g}`),
        });
        setO(res.r.p);
      } catch(e) {
        console.warn("Can't get tabulated permission", e);
      }
    }
    async function getR() {
      try {
        const res = await act(settings, {
          r: {t: {r: g}}
        }, {
          401: () => addUnauthorized(`Couldn't get Effective Recruiter Permission for ${g}`),
        });
        setR(res.r.p);
      } catch(e) {
        console.warn("Can't get tabulated permission", e);
      }
    }
    if (settings.actors.length > 0) {
      getU();
      getO();
      getR();
    }
  }, [settings, g])

  function ViewPermission({ p }) {
    const viewedP =
      p === "b" ? "Blind" :
      p === "r" ? "Read" :
      p === "c" ? "Create" :
      p === "u" ? "Update" : "Delete";
    return (
      <span>Permission: {viewedP}</span>
    );
  }

  function ViewExempt({ e }) {
    return (
      <span>{`Is ${e ? "" : "Not "}Exempt From Restriction`}</span>
    );
  }

  return (
    <>
      <h4 className="font-bold">Universe</h4>
      {u && (
        <div className="flex flex-row justify-around">
          <ViewPermission p={u.p} /><ViewExempt e={u.e} />
        </div>
      )}
      <h4 className="font-bold">Organization</h4>
      {o && (
        <div className="flex flex-row justify-around">
          <ViewPermission p={o.p} /><ViewExempt e={o.e} />
        </div>
      )}
      <h4 className="font-bold">Recruiter</h4>
      {r && (
        <div className="flex flex-row justify-around">
          <ViewPermission p={r} />
        </div>
      )}
      <h4 className="font-bold">Collections</h4>
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-row justify-center">
          <button className="btn btn-sm btn-secondary">Spaces</button>
        </div>
        <div className="flex flex-row justify-center">
          <button className="btn btn-sm btn-secondary">Entities</button>
        </div>
        <div className="flex flex-row justify-center">
          <button className="btn btn-sm btn-secondary">Groups</button>
        </div>
        <div className="flex flex-row justify-center">
          <button className="btn btn-sm btn-secondary">Members</button>
        </div>
      </div>
    </>
  );
}
