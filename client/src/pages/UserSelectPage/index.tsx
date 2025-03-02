import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./UserSelectPage.css";
import { API_URL } from "../../App";

interface User {
  id: number;
  name: string;
  email: string;
}

const UserSelectPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string>("");

  // Fetch existing users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/users`);
        if (res.ok) {
          const data: User[] = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  // When a user clicks a card, fill the input with that name.
  const handleCardClick = (name: string) => {
    setUserName(name);
  };

  // On submit, call the login endpoint.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) {
      setMessage("Please enter your name.");
      return;
    }
    try {
      // Call the login endpoint.
      // This endpoint will either create a new user or return an existing one.
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName }),
      });
      if (!res.ok) {
        throw new Error("Failed to login user");
      }
      const user = await res.json();
      // Save the user info in a cookie (for 7 days)
      Cookies.set("user", JSON.stringify(user), { expires: 7 });
      setMessage(`Welcome, ${user.name}!`);
      // Redirect to the main page
      window.location.href = "/";
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Error logging in.");
    }
  };

  return (
    <div className="user-select-container">
      <header className="user-select-header">
        <h2>Select or Enter Your Name</h2>
        <form onSubmit={handleSubmit} className="user-select-form">
          <input type="text" placeholder="Enter your name..." value={userName} onChange={(e) => setUserName(e.target.value)} />
          <button type="submit">Submit</button>
        </form>
      </header>
      <section className="user-cards-section">
        <h3>Other Users</h3>
        <div className="user-cards-container">
          {users.map((user) => (
            <div key={user.id} className="user-card" onClick={() => handleCardClick(user.name)}>
              {user.name}
            </div>
          ))}
        </div>
      </section>
      {message && <p className="user-select-message">{message}</p>}
    </div>
  );
};

export default UserSelectPage;
