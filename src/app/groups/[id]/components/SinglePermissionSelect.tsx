export default function SinglePermissionSelect({ permission, onChange }) {
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
