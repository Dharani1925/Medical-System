import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { getErrorMessage } from "../services/api";

const AuthContext = createContext(null);

const ROLE_HOME = {
  ADMIN: "/admin/dashboard",
  RECEPTIONIST: "/reception/dashboard",
  DOCTOR: "/doctor/dashboard",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // On first load, restore the session from localStorage and re-validate
  // the token against the backend, so a stale/expired token doesn't
  // silently pretend to be a valid login.
  useEffect(() => {
    const token = localStorage.getItem("clinic_token");
    const storedUser = localStorage.getItem("clinic_user");

    if (!token || !storedUser) {
      setInitializing(false);
      return;
    }

    setUser(JSON.parse(storedUser)); // optimistic restore for instant UI
    authService
      .me()
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem("clinic_user", JSON.stringify(res.data.data));
      })
      .catch(() => {
        // interceptor already clears storage + redirects on 401
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      const { token, user: loggedInUser } = res.data.data;
      localStorage.setItem("clinic_token", token);
      localStorage.setItem("clinic_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const logout = () => {
    localStorage.removeItem("clinic_token");
    localStorage.removeItem("clinic_user");
    setUser(null);
  };

  const homeRouteFor = (role) => ROLE_HOME[role] || "/login";

  return (
    <AuthContext.Provider value={{ user, login, logout, initializing, homeRouteFor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
