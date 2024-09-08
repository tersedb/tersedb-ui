import {useContext, useState, useEffect} from "react";
import {SettingsContext, act} from "@/contexts/SettingsContext";
import {UnauthorizedContext} from "@/contexts/UnauthorizedContext";

export default function EffectivePermissions({ g }) {
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
