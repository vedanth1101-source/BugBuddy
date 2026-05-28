import { Link, useRouterState } from "@tanstack/react-router";

interface NavItem {
  to: "/" | "/history";
  label: string;
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: "/", label: "Analyse" },
  { to: "/history", label: "History" },
];

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-950/85 dark:supports-[backdrop-filter]:bg-slate-950/70">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          to="/"
          className="font-bold tracking-tight text-lg text-slate-900 dark:text-white"
        >
          <span aria-hidden="true">🐛</span> BugBuddy
        </Link>

        <ul className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={[
                    "relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "text-blue-700 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                  <span
                    className={[
                      "absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-colors duration-200",
                      isActive ? "bg-blue-600 dark:bg-blue-400" : "bg-transparent",
                    ].join(" ")}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
