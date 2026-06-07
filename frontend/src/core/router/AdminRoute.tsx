import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { isAdminUser } from "../../utils/auth";

type AdminRouteProps = {
  children: React.ReactNode;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) return null;

  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
