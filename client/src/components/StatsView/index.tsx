import React from "react";
import { Movie, Review } from "../../types";

interface StatsViewProps {
  selectedMovie: Movie | null;
  reviews: Review[];
}

const StatsView: React.FC<StatsViewProps> = ({ selectedMovie, reviews }) => {
  if (!selectedMovie) {
    return (
      <div>
        <h3>Stats</h3>
        <p>Select a movie to see stats.</p>
      </div>
    );
  }

  // "Good" = rating >= 5, "Bad" = rating < 5
  const goodCount = reviews.filter((r) => r.rating >= 5).length;
  const badCount = reviews.filter((r) => r.rating < 5).length;
  const total = goodCount + badCount;

  const ratio = total === 0 ? 0 : goodCount / total;

  // Circle with conic gradient
  const circleStyle: React.CSSProperties = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: `conic-gradient(#4caf50 0% ${ratio * 100}%, #f44336 ${ratio * 100}% 100%)`,
    margin: "1rem auto",
  };

  return (
    <div>
      <h3>Stats for: {selectedMovie.title}</h3>
      <div style={circleStyle} />
      <p>
        Likes: {goodCount} | Dislikes: {badCount}
      </p>
    </div>
  );
};

export default StatsView;
