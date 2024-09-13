"use client";

export default function Settings({
  actors,
  strict,
  host,
  unauthorized,
  rmUnauthorized,
  onChange
}: {
  actors: string[],
  strict: boolean,
  host: string,
  unauthorized: string[],
  rmUnauthorized: (_: number) => void,
  onChange: (_: { actors: string[], strict: boolean, host: string }) => void,
}) {
  const viewActor = (actor: string, idx: number) => (
    <li className="my-1 flex flex-row gap-1 items-center" key={idx}>
      <input
        type="text"
        placeholder="a_1234567890ab"
        className="input grow"
        value={actor}
        onChange={(e) => onChange({
          host,
          strict,
          actors: actors.map((x, idx_) => idx_ === idx ? e.target.value : x)
        })} />
      <button
        className="btn btn-error btn-sm"
        onClick={() => onChange({
          strict,
          host,
          actors: actors.filter((_,idx_) => idx_ !== idx)
        })}>
        -
      </button>
    </li>
  );

  const unauthorizedNotices = unauthorized.map((notice, idx) => (
    <div
      role="alert"
      className="alert alert-warning w-full flex flex-row mb-2"
      onClick={() => rmUnauthorized(idx)}
      key={idx}>
      <span className="grow">{`Unauthorized: ${notice}`}</span>
    </div>
  ));

  return (
    <>
      <h1>Settings</h1>
      <ul className="menu rounded-box">
        <li>
          <h2 className="cursor-default">Actors</h2>
          {unauthorizedNotices}
          <ul>
            {actors.map(viewActor)}
          </ul>
          <div>
            <button
              onClick={() => onChange({
                strict,
                host,
                actors: [...actors, ""]
              })}
              className="btn btn-accent btn-sm">
              +
            </button>
          </div>
        </li>
        <li>
          <div className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                className="toggle"
                onChange={(e) => onChange({
                  actors,
                  host,
                  strict: e.target.checked
                })}
                checked={strict} />
              <span className="label-text">Strict Mode</span>
            </label>
          </div>
        </li>
        <li>
          <label className="label">
            <span className="label-text">TerseDB Host & Port</span>
            <input
              type="text"
              className="input"
              value={host}
              onChange={(e) => onChange({
                actors,
                strict,
                host: e.target.value
              })}
              placeholder="http://localhost:8000" />
          </label>
        </li>
      </ul>
    </>
  );
}
