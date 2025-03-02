import React, { useState } from "react";
import "./SeedPage.css";

const SeedPage: React.FC = () => {
  const [seedJson, setSeedJson] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Generate sample data: 10 movies and 10 users.
  const generateSampleData = () => {
    const movies = Array.from({ length: 10 }, (_, index) => {
      const id = index + 1;
      const genres = ["Action", "Drama", "Comedy", "Sci-Fi", "Horror"];
      const releaseDate = new Date(2020, index % 12, (index % 28) + 1).toISOString().split("T")[0];
      return {
        id,
        title: `Movie ${id}`,
        director: `Director ${id}`,
        releaseDate,
        genre: genres[index % genres.length],
        description: `Description for Movie ${id}. A great film that entertains and inspires.`,
        rating: parseFloat((Math.random() * 5 + 5).toFixed(1)),
      };
    });

    const users = Array.from({ length: 10 }, (_, index) => {
      const id = index + 1;
      return {
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
      };
    });

    // Combine into a single object.
    const seedData = {
      movies,
      users,
    };

    // Populate the textarea with pretty-printed JSON.
    setSeedJson(JSON.stringify(seedData, null, 2));
  };

  // Handler to seed the data to your API endpoints.
  const handleSeed = async () => {
    try {
      const seedData = JSON.parse(seedJson);

      const moviePromises = new Array<Promise<Response>>();
      // Seed movies.
      if (seedData.movies && Array.isArray(seedData.movies)) {
        for (const movie of seedData.movies) {
          moviePromises.push(
            fetch("http://localhost:3001/api/v1/movies", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(movie),
            })
          );
        }
      }
      await Promise.all(moviePromises);

      const userPromises = new Array<Promise<Response>>();
      // Seed users.
      if (seedData.users && Array.isArray(seedData.users)) {
        for (const user of seedData.users) {
          userPromises.push(
            fetch("http://localhost:3001/api/v1/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(user),
            })
          );
        }
      }
      await Promise.all(userPromises);

      const reviewPromises = new Array<Promise<Response>>();
      // Seed reviews if provided.
      if (seedData.reviews && Array.isArray(seedData.reviews)) {
        for (const review of seedData.reviews) {
          reviewPromises.push(
            fetch("http://localhost:3001/api/v1/reviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(review),
            })
          );
        }
      }
      await Promise.all(reviewPromises);

      setMessage("Seed data successfully uploaded!");
    } catch (error: any) {
      console.error(error);
      setMessage("Error seeding data: " + error.message);
    }
  };

  return (
    <div className="seed-container">
      <h2>Seed Data</h2>
      <p>
        Paste your JSON data below. The JSON should include <code>movies</code> and <code>users</code> arrays.
      </p>
      <textarea
        value={seedJson}
        onChange={(e) => setSeedJson(e.target.value)}
        rows={20}
        placeholder='{
  "movies": [ ... ],
  "users": [ ... ]
}'
      />
      <div className="button-row">
        <button onClick={generateSampleData}>Generate Sample Data</button>
        <button onClick={handleSeed}>Seed Data</button>
      </div>
      {message && <p className="seed-message">{message}</p>}
    </div>
  );
};

export default SeedPage;
