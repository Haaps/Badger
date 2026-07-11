import { Navigate, Route, Routes } from "react-router-dom";
import { componentCatalog } from "./catalog";
import { PreviewLayout } from "./PreviewLayout";

export function PreviewApp() {
  const defaultPath = componentCatalog[0]?.path ?? "";

  return (
    <Routes>
      <Route element={<PreviewLayout />}>
        <Route index element={<Navigate to={defaultPath} replace />} />
        {componentCatalog.map(({ path, Page }) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
      </Route>
    </Routes>
  );
}
