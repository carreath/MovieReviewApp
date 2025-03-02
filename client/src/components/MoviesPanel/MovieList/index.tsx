import React from "react";
import "./MoviesList.css";

export interface Movie {
  id: number;
  title: string;
  director: string;
  releaseDate: string; // ISO date string
  genre: string;
  description: string;
  rating?: number;
}

interface MoviesListProps {
  movies: Movie[];
  loading?: boolean;
}

const MoviesList: React.FC<MoviesListProps> = ({ movies, loading = false }) => {
  if (loading) {
    return <p>Loading movies...</p>;
  }

  if (movies.length === 0) {
    return <p>No movies available.</p>;
  }

  return (
    <div className="movies-list">
      {movies.map((movie) => (
        <div key={movie.id} className="movie-card">
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-director">
            <strong>Director:</strong> {movie.director}
          </p>
          <p className="movie-release">
            <strong>Release Date:</strong> {new Date(movie.releaseDate).toLocaleDateString()}
          </p>
          <p className="movie-genre">
            <strong>Genre:</strong> {movie.genre}
          </p>
          {movie.rating !== undefined && (
            <p className="movie-rating">
              <strong>Rating:</strong> {movie.rating}/10
            </p>
          )}
          <p className="movie-description">{movie.description}</p>
        </div>
      ))}
    </div>
  );
};

export default MoviesList;
