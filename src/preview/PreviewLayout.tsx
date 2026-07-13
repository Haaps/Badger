import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { componentCatalog } from "./catalog";
import type { ComponentEntry } from "./catalog";
import styles from "./PreviewLayout.module.css";

const SIDEBAR_COLLAPSED_KEY = "badger-preview-sidebar-collapsed";

function SidebarToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={styles.toggleIcon}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {collapsed ? (
        <path
          d="M6 4L10 8L6 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M10 4L6 8L10 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function NavItem({ entry }: { entry: ComponentEntry }) {
  if (entry.children?.length) {
    return (
      <div className={styles.navGroup}>
        <p className={styles.navGroupLabel}>{entry.label}</p>
        <div className={styles.navGroupItems}>
          {entry.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                [styles.navLink, styles.navSubLink, isActive && styles.navLinkActive]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  if (!entry.Page) {
    return null;
  }

  return (
    <NavLink
      to={entry.path}
      className={({ isActive }) =>
        [styles.navLink, isActive && styles.navLinkActive].filter(Boolean).join(" ")
      }
    >
      {entry.label}
    </NavLink>
  );
}

export function PreviewLayout() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  const sidebarClassNames = [styles.sidebar, collapsed && styles.sidebarCollapsed]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.shell}>
      <aside className={sidebarClassNames} aria-expanded={!collapsed}>
        <div className={styles.sidebarTop}>
          {!collapsed && (
            <div className={styles.sidebarHeader}>
              <p className={styles.eyebrow}>Badger</p>
              <h1 className={styles.title}>Components</h1>
            </div>
          )}

          <button
            type="button"
            className={styles.toggleButton}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleSidebar}
          >
            <SidebarToggleIcon collapsed={collapsed} />
          </button>
        </div>

        {!collapsed && (
          <nav className={styles.nav} aria-label="Component gallery">
            {componentCatalog
              .filter((entry) => entry.isGuide)
              .map((entry) => (
                <NavItem key={entry.path} entry={entry} />
              ))}
            <div className={styles.navDivider} aria-hidden="true" />
            {componentCatalog
              .filter((entry) => !entry.isGuide)
              .map((entry) => (
                <NavItem key={entry.path} entry={entry} />
              ))}
          </nav>
        )}
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
