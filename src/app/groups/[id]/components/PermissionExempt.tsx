"use client";

export default function PermissionExempt({
  exempt,
  onChange,
}: {
  exempt: boolean,
  onChange: (_: boolean) => void,
}) {
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
