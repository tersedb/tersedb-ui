"use client";

import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import TextSelect from "@/app/components/TextSelect";
import DialogButton from "@/app/components/DialogButton";
import {useContext, useState, useEffect, useRef} from "react";

export default function Actor({
  params: { id: a }
}: {
  params: { id: string }
}) {
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);
  const [membersOf, setMembersOf] = useState<string[] | null>(null);
  const [allGroups, setAllGroups] = useState<string[] | null>(null);
  const [membership, setMembership] = useState<string | null>(null);

  useEffect(() => {
    async function getMembersOf() {
      try {
        const res = await act(settings, {
          r: {m: a}
        }, {
          401: () => addUnauthorized(`Couldn't Read Group That ${a} Is A Member Of`),
        });
        setMembersOf(res.r.g);
      } catch(e) {
        console.warn("Couldn't get members of", e);
      }
    }
    async function getAllGroups() {
      try {
        const res = await act(settings, {
          r: "g"
        }, {
          401: () => addUnauthorized("Couldn't Read All Groups"),
        });
        setAllGroups(res.r.g);
      } catch(e) {
        console.warn("Couldn't get all groups", e);
      }
    }
    if (settings.actors.length > 0) {
      getMembersOf();
      getAllGroups();
    }
  }, [settings, a]);

  if (settings.actors.length === 0 || !membersOf || !allGroups) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const viewMembersOf = (
    <ul className="menu rounded-box">
      {membersOf.map((g) => (<li key={g}><a href={`/groups/${g}`}>{g}</a></li>))}
    </ul>
  );

  function addMembership(g: string) {

  }

  const possibleGroups = allGroups.filter((g) => !(membersOf.includes(g)));

  const modalContent = (
    <>
      <h3 className="font-bold text-lg">{`Add Group Membership For ${a}`}</h3>
      <TextSelect
        label="Add Membership"
        placeholder="g_1234..."
        options={possibleGroups}
        onSelect={setMembership} />
    </>
  );

  return (
    <>
      <div className="breadcrumbs text-sm">
        <ul>
          <li><a href="/actors">Actors</a></li>
          <li>{a}</li>
        </ul>
      </div>
      <h3 className="font-bold text-lg">Group Memberships</h3>
      {membersOf.length > 0 ? viewMembersOf : (<div>none</div>)}
      <DialogButton
        buttonText="Add To New Group"
        buttonVariant="secondary"
        onSubmit={() => membership && addMembership(membership)}
        modalContent={modalContent}
        submitText="Save"
        submitDisabled={!membership}
        onCloseModal={() => setMembership(null)}>{({button}) => 
          button
        }
      </DialogButton>
    </>
  );
}
