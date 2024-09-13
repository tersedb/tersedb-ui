"use client";

import MajorPermission from "./components/MajorPermission";
import MinorPermission from "./components/MinorPermission";
import EffectivePermissions from "./components/EffectivePermissions";
import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import TextSelect from "@/app/components/TextSelect";
import DeleteViaConfirm from "@/app/components/DeleteViaConfirm";
import {useState, useContext, useEffect, useRef} from "react";

export default function Group({ params: { id: g }}) {
  const [forceRepaint, setForceRepaint] = useState(false);
  const [members, setMembers] = useState(null);
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState(null);
  const [allGroups, setAllGroups] = useState(null);
  const [allActors, setAllActors] = useState(null);
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
    async function getAllGroups() {
      try {
        const res = await act(settings, {
          r: "g"
        }, {
          401: () => addUnauthorized("Read All Groups"),
        });
        setAllGroups(res.r.g);
      } catch(e) {
        console.warn("Couldn't Read All Groups", e);
      }
    }
    async function getAllActors() {
      try {
        const res = await act(settings, {
          r: "g"
        }, {
          401: () => addUnauthorized("Read All Actors"),
        });
        setAllActors(res.r.g);
      } catch(e) {
        console.warn("Couldn't Read All Actors", e);
      }
    }
    if (settings.actors.length > 0) {
      getMembers();
      getParent();
      getChildren();
      getAllGroups();
      getAllActors();
    }
  }, [settings, g])

  if (settings.actors.length === 0 || !members || !children || !allGroups || !allActors) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const possibleMembers = allActors.filter((a) => !(members.includes(a)));
  const possibleParentsOrChildren = allGroups.filter((g) => !(children.includes(g)) && parent !== g);

  const viewMembers = (
    <ul className="menu rounded-box">
      {members.map((a) => (
        <li key={a} className="flex flex-row w-full">
          <a className="grow" href={`/actors/${a}`}>{a}</a>
          <DeleteViaConfirm
            buttonText="-"
            buttonExtraClasses="btn-sm"
            onConfirm={() => {}}
            confirmText="Remove Member">
            Are you sure you want to remove {a} from {g}?
          </DeleteViaConfirm>
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
          <li><a href="/groups">Groups</a></li>
          <li>{g}</li>
        </ul>
      </div>
      <h3 className="font-bold text-lg">Members</h3>
      <TextSelect
        label="Add Member"
        placeholder="a_1234..."
        options={possibleMembers}
        onSelect={addMember} />
      {members.length > 0 ? viewMembers : "none"}
      <div className="divider"></div>
      <h3 className="font-bold text-lg">Parent Group</h3>
      <TextSelect
        label="Set Parent"
        placeholder="g_1234..."
        options={possibleParentsOrChildren}
        onSelect={() => {}} />
      {parent && parent.length > 0 ? viewParent : "no parent"}
      <div className="divider"></div>
      <h3 className="font-bold text-lg">Child Groups</h3>
      <TextSelect
        label="Add Child"
        placeholder="g_1234..."
        options={possibleParentsOrChildren}
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
