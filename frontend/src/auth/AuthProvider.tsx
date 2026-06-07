import { useEffect } from "react";
import { useAppDispatch } from "../redux/hooks";
import { loginSuccess, logout } from "../redux/slices/authSlice";
import { GetAccount } from "../services/ServiceApi";

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const fetchAccount = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        dispatch(logout());
        return;
      }

      try {
        const res = await GetAccount();

        if (res && +res.EC === 0) {
          dispatch(
            loginSuccess({
              user: res.DT,
              access_token: token,
            }),
          );
        } else {
          dispatch(logout());
        }
      } catch {
        dispatch(logout());
      }
    };

    fetchAccount();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
