import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ToastStack from "./components/ToastStack.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import LoginPage from "./components/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EntityPage from "./pages/EntityPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import WorkflowPage from "./pages/WorkflowPage.jsx";
import { entityDefinitions } from "./config/entities.js";
import { canAccessEntity, roleAccess } from "./config/roles.js";
import { useAppShell } from "./context/AppShellContext.jsx";

const ProtectedAnalytics = () => {
  const { user } = useAppShell();
  return roleAccess[user.role]?.analytics ? <AnalyticsPage /> : <Navigate to="/" replace />;
};

const ProtectedWorkflow = () => {
  const { user } = useAppShell();
  return roleAccess[user.role]?.workflow ? <WorkflowPage /> : <Navigate to="/" replace />;
};

const ProtectedEntityPage = () => {
  const { user } = useAppShell();
  const pathname = window.location.pathname;
  const entity = entityDefinitions.find((item) => pathname.includes(item.key));

  if (entity && !canAccessEntity(user.role, entity.key)) {
    return <Navigate to="/" replace />;
  }

  return <EntityPage />;
};

const App = () => {
  const { user, toasts, modalConfig, setModalConfig } = useAppShell();
  const visibleEntities = user
    ? entityDefinitions.filter((entity) => canAccessEntity(user.role, entity.key))
    : [];

  if (!user) {
    return (
      <>
        <ToastStack toasts={toasts} />
        <ConfirmModal config={modalConfig} onClose={() => setModalConfig(null)} />
        <LoginPage />
      </>
    );
  }

  return (
    <>
      <ToastStack toasts={toasts} />
      <ConfirmModal config={modalConfig} onClose={() => setModalConfig(null)} />
      <Layout entities={visibleEntities}>
        <Routes>
          <Route path="/" element={<DashboardPage entities={visibleEntities} />} />
          <Route path="/analytics" element={<ProtectedAnalytics />} />
          <Route path="/workflow" element={<ProtectedWorkflow />} />
          <Route path="/entities/:entityKey" element={<ProtectedEntityPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  );
};

export default App;
