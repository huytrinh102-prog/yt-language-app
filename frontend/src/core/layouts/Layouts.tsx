import { Outlet } from "react-router-dom";
import Navi from "../navigation/Nav";
export default function MainLayout() {
  return (
    <div className="app-shell">
      <Navi />
      <Outlet />
    </div>
  );
}
