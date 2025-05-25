import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

interface User {
  id: number;
  name: string;
  email: string;
}

interface HeaderProps {
  user?: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [isSeed, setIsSeed] = useState<boolean>(window.location.pathname === "/seed");
  const [isRankings, setIsRankings] = useState<boolean>(window.location.pathname === "/rankings");
  // Dark mode toggle state.
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // When darkMode state changes, add/remove a class on <body>.
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Movie Review App</h1>
      </div>
      <div className="header-right">
        <nav>
          <Link
            to={isSeed ? "/" : "/seed"}
            onClick={() => {
              setIsSeed((prev) => !prev);
              setIsRankings(false);
            }}>
            <button className="seed-button">{isSeed ? "Home" : "Seed"}</button>
          </Link>
          <Link
            to={isRankings ? "/" : "/rankings"}
            onClick={() => {
              setIsRankings((prev) => !prev);
              setIsSeed(false);
            }}>
            <button className="seed-button">{isRankings ? "Home" : "Rankings"}</button>
          </Link>
        </nav>
        <button className="seed-button" onClick={() => setDarkMode((prev) => !prev)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        {user ? (
          <div className="user-info">
            <span className="user-name">Welcome, {user.name}</span>
          </div>
        ) : (
          <Link to="/user-select">
            <button className="seed-button">Choose User</button>P
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
