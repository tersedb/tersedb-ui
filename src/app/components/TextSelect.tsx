"use client";

import {useState} from "react";

export default function TextSelect({
  label,
  placeholder,
  options,
  onSelect
}: {
  label: React.ReactNode,
  placeholder: string,
  options: string[],
  onSelect: (_: string) => void,
}) {
  const [value, setValue] = useState("");

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  const viewOptions = value !== "" && (
    <ul className="menu rounded-box">
      {
        options
          .filter((o) => o.startsWith(value))
          .map((o) => (
            <li key={o}>
              <a
                className={o === value ? "active" : ""}
                onClick={() => {
                setValue(o);
                onSelect(o);
              }}>
                {o}
              </a>
            </li>
          ))
      }
    </ul>
  );

  return (
    <>
      <label className="label">
        <span className="label-text mr-2">{label}</span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="input input-bordered w-full" />
      </label>
      {viewOptions}
    </>
  );
}
