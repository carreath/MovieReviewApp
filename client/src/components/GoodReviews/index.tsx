import React from "react";
import { Review } from "../../types";
import ReviewCard from "../ReviewCard";

interface GoodReviewsProps {
  reviews: Review[];
}

const GoodReviews: React.FC<GoodReviewsProps> = ({ reviews }) => {
  const goodReviews = reviews.filter((r) => r.rating > 5);

  return (
    <div style={{ maxWidth: "95vw", overflow: "hidden" }}>
      <h3>Good Reviews</h3>
      {goodReviews.length === 0 ? <p>No good reviews yet.</p> : goodReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
    </div>
  );
};

export default GoodReviews;
