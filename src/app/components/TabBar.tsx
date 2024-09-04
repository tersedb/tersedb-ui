"use client";

import { usePathname } from "next/navigation";

export default function TabBar() {
  const pathname = usePathname();

  const mkTab = ({route, name}) => (
    <a
      key={route}
      href={route}
      role="tab"
      className={"tab" + (pathname === route ? " tab-active" : "")}>
      {name}
    </a>
  );

  const tabs = [
    {route: "/", name: "Groups"},
    {route: "/actors", name: "Actors"},
    {route: "/spaces", name: "Spaces"}
  ]

  return (
    <div role="tablist" className="tabs tabs-bordered">
      {
        tabs.map(mkTab)
      }
    </div>
  );
}
