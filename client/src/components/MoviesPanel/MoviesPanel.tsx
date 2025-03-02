import React, { useEffect, useState } from "react";
import MoviesList, { Movie } from "./MovieList";
import { API_URL } from "../../App";

const MoviesPanel: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/movies`);
        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }
        const moviesData = await response.json();
        setMovies(moviesData);
      } catch (error) {
        console.error("Error fetching movies", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  return (
    <div style={{ width: "300px" }}>
      <MoviesList movies={movies} loading={loading} />
    </div>
  );
};

export default MoviesPanel;
