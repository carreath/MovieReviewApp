import React, { useEffect, useState } from "react";
import "./RankingsPage.css";
import { Movie, Review } from "../../types";
import { API_URL } from "../../App";

interface MovieRanking {
  movieId: number;
  rating: number;
  reviewCount: number;
  recommended_by: string;
}

const RankingsPage: React.FC = () => {
  const [rankings, setRankings] = useState<MovieRanking[]>([]);
  const [error, setError] = useState<string>("");
  const [movies, setMovies] = useState<Record<number, Movie>>({});
  const [loading, setLoading] = useState(true);

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
        const newMovies: Record<number, Movie> = {};
        data.forEach((movie) => {
          newMovies[movie.id] = movie;
        });
        console.log(newMovies);
        setMovies(newMovies);
      } catch (err) {
        setError("Error loading movies");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Fetch and aggregate reviews by movie
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch(`${API_URL}/reviews`);
        if (!response.ok) {
          throw new Error(`Error fetching reviews: ${response.statusText}`);
        }
        const data = (await response.json()) as Review[];

        const reviewsByMovie: Record<number, MovieRanking> = {};
        data.forEach((review) => {
          if (!reviewsByMovie[review.movieId]) {
            reviewsByMovie[review.movieId] = {
              movieId: review.movieId,
              reviewCount: 0,
              rating: 0,
              recommended_by: movies[review.movieId]?.recommended_by || "Unknown",
            };
          }
          reviewsByMovie[review.movieId].reviewCount += 1;
          reviewsByMovie[review.movieId].rating += review.rating;
        });

        const rankingsArray = Object.values(reviewsByMovie).map((ranking) => ({
          ...ranking,
          rating: ranking.rating / ranking.reviewCount,
        }));
        rankingsArray.sort((a, b) => b.rating - a.rating);
        setRankings(rankingsArray);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchRankings();
  }, [movies]);

  // Determine podium items if available
  const podiumAvailable = rankings.length >= 3;
  const first = podiumAvailable ? rankings[0] : null;
  const second = podiumAvailable ? rankings[1] : null;
  const third = podiumAvailable ? rankings[2] : null;

  return (
    <div className="rankings-container">
      <h2>Movie Rankings (by Reviews)</h2>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="loading">Loading movies...</p>
      ) : (
        <>
          {podiumAvailable && (
            <div className="podium-container">
              <div className="podium-item podium-second">
                <div className="medal medal-silver">🥈</div>
                <div className="movie-title">{movies[second!.movieId] ? movies[second!.movieId].title : "Unknown"}</div>
                <div className="movie-rating">{second!.rating.toFixed(1)}</div>
                <div className="movie-reviews">{second!.reviewCount} reviews</div>
              </div>
              <div className="podium-item podium-first">
                <div className="medal medal-gold">🥇</div>
                <div className="movie-title">{movies[first!.movieId] ? movies[first!.movieId].title : "Unknown"}</div>
                <div className="movie-rating">{first!.rating.toFixed(1)}</div>
                <div className="movie-reviews">{first!.reviewCount} reviews</div>
              </div>
              <div className="podium-item podium-third">
                <div className="medal medal-bronze">🥉</div>
                <div className="movie-title">{movies[third!.movieId] ? movies[third!.movieId].title : "Unknown"}</div>
                <div className="movie-rating">{third!.rating.toFixed(1)}</div>
                <div className="movie-reviews">{third!.reviewCount} reviews</div>
              </div>
            </div>
          )}

          <div className="full-rankings">
            <h3>Full Rankings</h3>
            <ul className="rankings-list-headers">
              <li className="rankings-list-header-item">Rank</li>
              <li className="rankings-list-header-item">Title</li>
              <li className="rankings-list-header-item">Avg. Rating</li>
              <li className="rankings-list-header-item">Review Count</li>
              <li className="rankings-list-header-item">Recommended By</li>
            </ul>
            <ul className="rankings-list">
              {rankings.map((ranking, index) => (
                <li key={ranking.movieId} className="ranking-item">
                  <span className="rank">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}</span>
                  <span className="movie">{movies[ranking.movieId] ? movies[ranking.movieId].title : "Unknown"}</span>
                  <span className="avg-rating">{ranking.rating.toFixed(1)}</span>
                  <span className="review-count">{ranking.reviewCount}</span>
                  <span className="review-count">{ranking.recommended_by}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default RankingsPage;
