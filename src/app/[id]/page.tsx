"use client";

import {SettingsContext, act} from "../components/SettingsContext";
import TextSelect from "../components/TextSelect";
import {useState, useContext, useEffect} from "react";

export default function Group({ params: { id: g }}) {
  const [forceRepaint, setForceRepaint] = useState(false);
  const [members, setMembers] = useState(null);
  const [possibleMembers, setPossibleMembers] = useState([]);
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState(null);
  const settings = useContext(SettingsContext);

  useEffect(() => {
    async function getMembers() {
      try {
        const res = await act(settings, {
          r: {m: g}
        });
        setMembers(res.r.a);
      } catch(e) {
        console.warn("Couldn't act", e);
      }
    }
    getMembers();
  }, [settings, g])

  useEffect(() => {
    async function getPossibleMembers() {
      try {
        const res = await act(settings, {
          r: "a"
        });
        setPossibleMembers(res.r.a.filter((a) => !(members.includes(a))));
      } catch(e) {
        console.warn("Couldn't act", e);
      }
    }
    getPossibleMembers();
  }, [settings, g, members]);

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

  function addMember(a) {
    async function go() {
      try {
        const res = await act(settings, {
          c: {m: {g, a}}
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
      <label className="label">
        <span className="label-text mr-2">Set Parent</span>
        <input type="text" placeholder="g_1234..." className="input input-bordered w-full" />
      </label>
      {parent && parent.length > 0 ? parent[0] : "no parent"}
      <div className="divider"></div>
      <h4 className="font-bold">Child Groups</h4>
      <label className="label">
        <span className="label-text mr-2">Add Child</span>
        <input type="text" placeholder="g_1234..." className="input input-bordered w-full" />
      </label>
      {children && children.length > 0 ? children : "none"}
      <h3 className="font-bold mt-2 text-lg">Permissions</h3>
      <h4 className="font-bold">Universe</h4>
      <MajorPermission g={g} p="u" onChange={() => {}} />
      <h4 className="font-bold">Organization</h4>
      <MajorPermission g={g} p="o" onChange={() => {}} />
      <h4 className="font-bold">Recruiter</h4>
      <MajorPermission g={g} p="r" onChange={() => {}} />
      <h4 className="font-bold">Spaces</h4>
    </>
  );
}

function MajorPermission({ g, p, s, onChange }) {
  const [permission, setPermission] = useState(null);
  const settings = useContext(SettingsContext);

  useEffect(() => {
    async function getPermission() {
      try {
        const res = await act(settings, {
          r: {[p]: s ? {g,s} : g}
        });
        setPermission(res.r.p);
      } catch(e) {
        console.warn("Couldn't act", e);
      }
    }
    getPermission();
  }, [settings, g])

  if (p === "u" || p === "o") {
    return (
      <div className="flex flex-row">
        <PermissionSelect
          permission={permission && permission.p}
          onChange={(p) => onChange({e, p})} />
        <PermissionExempt
          exempt={permission && permission.e}
          onChange={(e) => onChange({e, p})} />
      </div>
    );
  } else {
    return (
      <PermissionSelect
        permission={permission}
        onChange={(p) => onChange(p)} />
    );
  }
}

function PermissionSelect({ permission, onChange }) {
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
      onChange={(e) => onChange(e.target.value)} value={permission}>
      <option disabled selected={!permission}>Permission</option>
      {perms.map(({p,name}) => (
        <option key={p} value={p} selected={p === permission}>{name}</option>
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

function GroupPermissionSelect({ permission, onChange }) {
  let perms = [
    { p: "n", name: "NonExistent" },
    { p: "e", name: "Exists" },
    { p: "a", name: "Adjust" },
    { p: "o", name: "Obliterate" },
  ]

  return (
    <>
      <label className="label">
        <span className="label-text mr-2">Enabled?</span>
        <input
          type="checkbox"
          className="toggle"
          checked={permission ? true : false}
          onChange={(e) => onChange(e.target.checked ? "e" : null)} />
      </label>
      <select
        className="select select-bordered grow w-full"
        onChange={(e) => onChange(e.target.value)}>
        <option disabled selected={!permission}>Permission</option>
        {perms.map(({p,name}) => (
          <option key={p} value={p} selected={p === permission}>{name}</option>
        ))}
      </select>
    </>
  );
}

