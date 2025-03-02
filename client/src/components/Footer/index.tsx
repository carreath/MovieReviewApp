import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} Movie Review App. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
