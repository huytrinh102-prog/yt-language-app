import { useEffect } from "react";
import { useAppSelector } from "./redux/hooks";
import "./App.css";
import AuthProvider from "./auth/AuthProvider";
import AppRouter from "./core/router/Router";
import { ToastContainer } from "react-toastify";
import LoadingPage from "./core/layouts/LoadingPage";
function App() {
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <>
      {isLoading && <LoadingPage />}
      <AuthProvider>
        <AppRouter />
        <ToastContainer
          autoClose={1500}
          pauseOnHover={false}
          closeOnClick
          draggable={false}
        />
      </AuthProvider>
    </>
  );
}

export default App;
