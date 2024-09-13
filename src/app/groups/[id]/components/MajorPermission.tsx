import CollectionPermissionSelect from "./CollectionPermissionSelect";
import PermissionExempt from "./PermissionExempt";
import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";
import {useState, useContext, useEffect} from "react";

export default function MajorPermission({
  g,
  pName,
  pLabel,
  s,
  onSelect,
}: {
  g: string,
  pName: "u" | "o" | "r",
  pLabel: string,
  s?: string,
  onSelect?: () => void,
}) {
  const [permission, setPermission] =
    useState<string | {e: boolean, p: string} | null>(null);
  const settings = useContext(SettingsContext);
  const addUnauthorized = useContext(UnauthorizedContext);

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

  function onChange({e, p}: {e?: boolean, p: string}) {
    async function go() {
      try {
        const newPermission = e ? { e, p } : p
        const res = await act(settings, {
          u: {"p": {[pName]: {g, "p": newPermission}}}
        }, {
          401: () => addUnauthorized(`Couldn't set ${pLabel} Permission For ${g}`)
        });
        setPermission(newPermission)
        // setForceRepaint(!forceRepaint);
        if (onSelect) onSelect();
      } catch(e) {
        console.warn("Couldn't set", e);
      }
    }
    go();
  }

  if (permission !== null) {
    if ((pName === "u" || pName === "o") && typeof permission !== "string") {
      return (
        <div className="flex flex-row">
          <CollectionPermissionSelect
            permission={permission && permission.p}
            onChange={(p) => onChange({...permission, p})} />
          <PermissionExempt
            exempt={permission && permission.e}
            onChange={(e) => onChange({p: permission.p, e})} />
        </div>
      );
    } else if (typeof permission === "string") {
      return (
        <CollectionPermissionSelect
          permission={permission}
          onChange={(p) => onChange({ p })} />
      );
    }
  }
}
