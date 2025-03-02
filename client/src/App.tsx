import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";
import HomePage from "./pages/home";
import SeedPage from "./pages/SeedPage";
import RequireUser from "./components/RequireUser";
import UserSelectPage from "./pages/UserSelectPage";
import Cookies from "js-cookie";

export const API_URL = `${window.location.protocol}//${window.location.hostname}:3001/api/v1`;

const App: React.FC = () => {
  const [user, setUser] = useState<any>();
  const [refreshedUser, setRefreshedUser] = useState<boolean>(false);

  useEffect(() => {
    if (!user || refreshedUser) {
      return;
    }

    const fetchUsers = async (retries = 0) => {
      if (retries > 3) {
        Cookies.remove("user");
        setUser(undefined);
        window.location.reload();
        setRefreshedUser(true);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/users/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.name === user.name) {
              setUser(data);
              Cookies.set("user", JSON.stringify(data), { expires: 7 });
            } else {
              Cookies.remove("user");
              setUser(undefined);
              window.location.reload();
            }
            setRefreshedUser(true);
          }
        } else {
          await setTimeout(() => fetchUsers(retries + 1), 100);
        }
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, [user, setUser, refreshedUser, setRefreshedUser]);

  // Fetch the user from the cookie on startup
  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }
  }, []);

  return (
    <Router>
      <Header user={user} />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <RequireUser>
                <HomePage user={user} />
              </RequireUser>
            }
          />
          <Route
            path="/seed"
            element={
              <RequireUser>
                <SeedPage />
              </RequireUser>
            }
          />
          <Route path="/user-select" element={<UserSelectPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
