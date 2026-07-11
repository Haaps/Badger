import { NavLink, Outlet } from "react-router-dom";
import { componentCatalog } from "./catalog";
import styles from "./PreviewLayout.module.css";

export function PreviewLayout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <p className={styles.eyebrow}>Badger</p>
          <h1 className={styles.title}>Components</h1>
        </div>

        <nav className={styles.nav} aria-label="Component gallery">
          {componentCatalog.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                [styles.navLink, isActive && styles.navLinkActive]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
