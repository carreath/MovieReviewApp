import React, { useState } from "react";
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
  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Movie Review App</h1>
      </div>
      <nav>
        <Link to={isSeed ? "/" : "/seed"} onClick={() => setIsSeed(!isSeed)}>
          <button className="seed-button">{isSeed ? "Home" : "Seed"}</button>
        </Link>
      </nav>
      <div className="header-right">
        {user ? (
          <div className="user-info">
            <span className="user-name">Welcome, {user.name}</span>
          </div>
        ) : (
          <Link to="/user-select">
            <button className="seed-button">Choose User</button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
