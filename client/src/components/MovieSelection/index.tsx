import React, { useEffect, useState } from "react";
import { Movie, Review } from "../../types";
import { API_URL } from "../../App";
import "./MovieSelection.css";

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

  useEffect(() => {
    if (!selectedMovie && movies.length > 0) {
      onSelectMovie(movies[0]);
    }
  }, [movies, selectedMovie, onSelectMovie]);

  return (
    <div className="movie-selection">
      <h3>Movies</h3>
      {loading ? (
        <p>Loading movies...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="movie-list">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className={`movie-item ${selectedMovie && selectedMovie.id === movie.id ? "selected" : ""}`}
              onClick={() => onSelectMovie(movie)}>
              <h4>{movie.title}</h4>
              <p className="movie-description">{movie.description}</p>
              <div className="tags">
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
