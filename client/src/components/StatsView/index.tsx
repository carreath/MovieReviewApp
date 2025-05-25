import React from "react";
import { Movie, Review } from "../../types";
import "./StatsView.css";

interface StatsViewProps {
  selectedMovie: Movie | null;
  reviews: Review[];
}

const StatsView: React.FC<StatsViewProps> = ({ selectedMovie, reviews }) => {
  if (!selectedMovie) {
    return (
      <div className="stats-view">
        <h3>Stats</h3>
        <p>Select a movie to see stats.</p>
      </div>
    );
  }

  const totalReviews = reviews.length;
  const averageRating = totalReviews ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : "0";

  // Build distribution for ratings 1-10.
  const distribution: { [key: number]: number } = {};
  for (let i = 0; i <= 10; i++) {
    distribution[i] = reviews.filter((r) => r.rating === i).length;
  }
  const maxCount = Math.max(...Object.values(distribution)) || 1;

  // Calculate the ratio of "good" (rating >= 5) reviews for the pie chart.
  const goodCount = reviews.filter((r) => r.rating >= 5).length;
  const pieRatio = totalReviews ? (goodCount / totalReviews) * 100 : 0;

  return (
    <div className="stats-view">
      <h3>Stats for: {selectedMovie.title}</h3>
      <p>Average Rating: {averageRating} / 10</p>
      <div className="charts-container">
        {/* Pie Chart */}
        <div className="pie-chart-container">
          <div
            className="pie-chart"
            style={{
              background: `conic-gradient(#4caf50 0% ${pieRatio}%, #f44336 ${pieRatio}% 100%)`,
            }}></div>
          <p className="chart-label">Good vs. Bad Reviews</p>
        </div>
        {/* Bar Chart */}
        <div className="bar-chart-container">
          <p className="total-reviews">Total Reviews: {totalReviews}</p>
          <div className="bar-chart">
            {Object.entries(distribution)
              .reverse()
              .map(([rating, count], index) => {
                const barWidth = (Number(count) / maxCount) * 100;
                return (
                  <div key={rating} className="bar-row">
                    <span className="bar-label">{rating}</span>
                    <div className={`bar bar-index-${index}`} style={{ maxWidth: `${barWidth}%` }}>
                      <span className="bar-count">{count}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
