"use client";

import { usePathname } from "next/navigation";

export default function TabBar() {
  const pathname = usePathname();

  const tabs = [
    {route: "/groups", name: "Groups"},
    {route: "/actors", name: "Actors"},
    {route: "/spaces", name: "Spaces", or: ["/entities", "/versions"]}
  ]

  function hasPrefix({route, or}) {
    if (pathname.startsWith(route)) {
      return true;
    }
    if (or) {
      if (or.some((alternate) => pathname.startsWith(alternate))) {
        return true;
      }
    }

    return false;
  }

  const mkTab = ({route, name, or}) => (
    <a
      key={route}
      href={route}
      role="tab"
      className={
        "tab" + (hasPrefix({route, or}) ? " tab-active" : "")
      }>
      {name}
    </a>
  );

  return (
    <div role="tablist" className="tabs tabs-bordered">
      {
        tabs.map(mkTab)
      }
    </div>
  );
}
