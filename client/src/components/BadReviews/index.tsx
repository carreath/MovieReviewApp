import React from "react";
import { Review } from "../../types";
import ReviewCard from "../ReviewCard";

interface BadReviewsProps {
  reviews: Review[];
}

const BadReviews: React.FC<BadReviewsProps> = ({ reviews }) => {
  const badReviews = reviews.filter((r) => r.rating < 5);

  return (
    <div>
      <h3>Bad Reviews</h3>
      {badReviews.length === 0 ? <p>No bad reviews yet.</p> : badReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
    </div>
  );
};

export default BadReviews;
