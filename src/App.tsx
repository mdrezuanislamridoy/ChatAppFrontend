import { useEffect, useState } from "react";
import { useAuthStore } from "./store/auth.store";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Messenger from "./pages/messenger/Messenger";
import Login from "./pages/login/login";
import Signup from "./pages/signup/signup";

export default function App() {
  const { profile, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        await profile();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={user ? <Messenger /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to={"/"} />}
          />
          <Route
            path="/"
            element={!user ? <Signup /> : <Navigate to={"/"} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
