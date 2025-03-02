import React, { useEffect, useState } from "react";
import { Movie, Review } from "../../types";
import { API_URL } from "../../App";

interface MovieSelectionProps {
  userId: number;
  selectedMovie: Movie | null;
  onSelectMovie: (movie: Movie) => void;
  onFetchReviews: (reviews: Review[], refetch: Function) => void;
}

const MovieSelection: React.FC<MovieSelectionProps> = ({ userId, selectedMovie, onSelectMovie, onFetchReviews }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch movies from the server
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/movies`);
        if (!res.ok) {
          throw new Error("Failed to fetch movies");
        }
        const data: Movie[] = await res.json();
        setMovies(data);
      } catch (err) {
        setError("Error loading movies");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Whenever selectedMovie changes, fetch reviews for that movie
  useEffect(() => {
    if (!selectedMovie) return;
    const fetchReviewsForMovie = async () => {
      try {
        const url = `${API_URL}/movies/reviews/${selectedMovie.id}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to fetch reviews for movie");
        }
        const reviews: Review[] = await res.json();
        onFetchReviews(reviews, fetchReviewsForMovie);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviewsForMovie();
  }, [selectedMovie, onFetchReviews]);

  return (
    <div>
      <h3>Movies</h3>
      {loading ? (
        <p>Loading movies...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {movies &&
            movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                style={{
                  padding: "0.5rem",
                  marginBottom: "0.5rem",
                  backgroundColor: selectedMovie && selectedMovie.id === movie.id ? "#c8e6c9" : "#f5f5f5",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}>
                <h4>{movie.title}</h4>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>{movie.description}</p>
                <div>
                  {movie?.tags?.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MovieSelection;
