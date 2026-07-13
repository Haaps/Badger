import { Navigate, Route, Routes } from "react-router-dom";
import { getRoutableEntries } from "./catalog";
import { PreviewLayout } from "./PreviewLayout";

const routableEntries = getRoutableEntries();

export function PreviewApp() {
  const defaultPath = routableEntries[0]?.path ?? "";

  return (
    <Routes>
      <Route element={<PreviewLayout />}>
        <Route index element={<Navigate to={defaultPath} replace />} />
        <Route
          path="summary-panel"
          element={<Navigate to="summary-panel/list-validation" replace />}
        />
        {routableEntries.map(({ path, Page }) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
      </Route>
    </Routes>
  );
}
