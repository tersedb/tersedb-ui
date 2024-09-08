export default function CollectionPermissionSelect({ permission, onChange }) {
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
